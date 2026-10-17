import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { limpiar, neutralizarFormula } from "./sanitizar.ts";
import { permitido, _reiniciar } from "./limite.ts";
import { mismoOrigen } from "./origen.ts";
import { firmaValida } from "./firma.ts";
import { montoEsperado } from "./pagos.ts";
import { cotizarPlan } from "./precios.ts";
import { validarServidor } from "./validacion.ts";

test("neutraliza fórmulas de planilla", () => {
  for (const v of ['=IMPORTXML("https://x")', "+1", "-1+1", "@SUM(A1)"]) assert.equal(neutralizarFormula(v), `'${v}`);
  assert.equal(neutralizarFormula("Ana Pérez"), "Ana Pérez");
});

test("limpia saltos de línea y recorta", () => {
  assert.equal(limpiar("a\nb\u0000c", 10), "a b c");
  assert.equal(limpiar("x".repeat(500), 20).length, 20);
});

test("el límite de envíos corta al pasar el máximo y se libera con el tiempo", () => {
  _reiniciar();
  assert.equal(permitido("ip", 2, 1000, 0), true);
  assert.equal(permitido("ip", 2, 1000, 1), true);
  assert.equal(permitido("ip", 2, 1000, 2), false);
  assert.equal(permitido("ip", 2, 1000, 2000), true);
});

test("solo acepta POST del mismo origen", () => {
  const pedido = (h: Record<string, string>) => new Request("https://silverjob.cl/api/lista", { method: "POST", headers: h });
  assert.equal(mismoOrigen(pedido({ origin: "https://silverjob.cl", host: "silverjob.cl" })), true);
  assert.equal(mismoOrigen(pedido({ origin: "https://malo.example", host: "silverjob.cl" })), false);
  assert.equal(mismoOrigen(pedido({ host: "silverjob.cl" })), false);
});

test("la firma del webhook caduca", () => {
  const secreto = "s";
  const ts = String(1_700_000_000_000);
  const v1 = createHmac("sha256", secreto).update(`id:1;request-id:r;ts:${ts};`).digest("hex");
  const base = { firma: `ts=${ts},v1=${v1}`, requestId: "r", dataId: "1", secreto, toleranciaMs: 600_000 };
  assert.equal(firmaValida({ ...base, ahora: 1_700_000_100_000 }), true);
  assert.equal(firmaValida({ ...base, ahora: 1_700_001_000_000 }), false);
});

test("el monto esperado de un pago coincide con la cotización", () => {
  const metadata = { tipo: "plan", gerencia: "otras", horas: "18", modalidad: "mensual" };
  assert.equal(montoEsperado(metadata), cotizarPlan({ gerencia: "otras", horas: 18, modalidad: "mensual" }).total);
  assert.equal(montoEsperado(metadata), 1_710_000);
  assert.equal(montoEsperado({ tipo: "plan", gerencia: "otras", horas: 99 }), null);
  assert.equal(montoEsperado(undefined), null);
});

const pyme = { tipo: "pyme", nombre: "Ana", correo: "ANA@pyme.cl", empresa: "Pyme SpA", area: "Operaciones", horas: "Hasta 10 (Básico)", consentimiento: "si" };

test("el servidor valida y normaliza el registro de una pyme", () => {
  const r = validarServidor(pyme);
  assert.ok("registro" in r);
  if ("registro" in r) {
    assert.equal(r.registro.correo, "ana@pyme.cl");
    assert.equal(r.registro.linkedin, null);
  }
});

test("el servidor rechaza opciones inventadas, largos y LinkedIn ajeno", () => {
  assert.deepEqual(validarServidor({ ...pyme, area: "Hackeo" }), { error: "area" });
  assert.deepEqual(validarServidor({ ...pyme, horas: "mil" }), { error: "horas" });
  assert.deepEqual(validarServidor({ ...pyme, consentimiento: "" }), { error: "consentimiento" });
  assert.deepEqual(validarServidor({ ...pyme, tipo: "otro" }), { error: "tipo" });
  const ejec = { tipo: "ejecutivo", nombre: "Luis", correo: "luis@x.cl", area: "Finanzas", anios: "Más de 30", consentimiento: "si" };
  assert.deepEqual(validarServidor({ ...ejec, linkedin: "https://evil.com/?linkedin.com/in/x" }), { error: "linkedin" });
  assert.ok("registro" in validarServidor({ ...ejec, linkedin: "linkedin.com/in/luis-perez" }));
  const largo = validarServidor({ ...pyme, nombre: "x".repeat(1000) });
  assert.ok("registro" in largo && largo.registro.nombre.length === 120);
});
