import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TRAMOS, cotizarBloques, cotizarPlan, mensualidad, precioBloque, redondeo500, tramoDe, esHorasValidas,
} from "./precios.ts";

test("precio hora sale de la fórmula de CLAUDE.md", () => {
  const valor = { general: 75_000, otras: 60_000 };
  const margen = { basico: 0.3, estandar: 0.25, intensivo: 0.2 };
  for (const t of TRAMOS) {
    for (const g of ["general", "otras"] as const) {
      assert.equal(t.precioHora[g], redondeo500((valor[g] / (1 - margen[t.id])) * 1.19), `${t.id} ${g}`);
    }
  }
});

test("tramos 1-10, 11-26, 27-40", () => {
  assert.equal(tramoDe(10).id, "basico");
  assert.equal(tramoDe(11).id, "estandar");
  assert.equal(tramoDe(26).id, "estandar");
  assert.equal(tramoDe(27).id, "intensivo");
  assert.equal(tramoDe(40).id, "intensivo");
  assert.throws(() => tramoDe(41));
  assert.equal(esHorasValidas(0), false);
  assert.equal(esHorasValidas(2.5), false);
});

test("piso solo en 27 h", () => {
  assert.deepEqual([mensualidad("general", 27).monto, mensualidad("general", 27).pisoAplicado], [3_094_000, true]);
  assert.deepEqual([mensualidad("otras", 27).monto, mensualidad("otras", 27).pisoAplicado], [2_470_000, true]);
  assert.equal(mensualidad("general", 28).pisoAplicado, false);
  assert.equal(mensualidad("otras", 28).pisoAplicado, false);
  assert.equal(mensualidad("general", 11).pisoAplicado, false);
  // Sumar una hora siempre cuesta más, salvo 27 h, que cuesta lo mismo que 26 h por el piso
  for (const g of ["general", "otras"] as const) {
    for (let h = 2; h <= 40; h++) {
      const [antes, ahora] = [mensualidad(g, h - 1).monto, mensualidad(g, h).monto];
      if (h === 27) assert.equal(ahora, antes, `${g} ${h}`);
      else assert.ok(ahora > antes, `${g} ${h}`);
    }
  }
});

test("bloques de 5 h", () => {
  const esperados = { basico: [702_500, 560_000], estandar: [655_000, 522_500], intensivo: [612_500, 492_500] };
  for (const t of TRAMOS) {
    assert.equal(precioBloque("general", t), esperados[t.id][0]);
    assert.equal(precioBloque("otras", t), esperados[t.id][1]);
  }
  assert.equal(cotizarBloques({ gerencia: "otras", tramo: TRAMOS[1], cantidad: 2 }).total, 1_045_000);
});

test("plan anual y fee de match", () => {
  const anual = cotizarPlan({ gerencia: "otras", horas: 18, modalidad: "anual", primeraContratacion: false });
  assert.equal(anual.total, 18_468_000);
  const primera = cotizarPlan({ gerencia: "otras", horas: 18, modalidad: "mensual", primeraContratacion: true });
  assert.deepEqual(primera.lineas.map((l) => l.monto), [1_710_000, 150_000]);
  assert.equal(primera.total, 1_860_000);
});
