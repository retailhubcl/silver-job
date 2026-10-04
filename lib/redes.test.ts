import { test } from "node:test";
import assert from "node:assert/strict";
import { desdeSantiago, aSantiago, siguienteVentana } from "./redes/fechas.ts";
import { elegirTema, parsearRespuesta, plantilla, TEMAS } from "./redes/generar.ts";
import { escaparLinkedin } from "./redes/linkedin.ts";
import { claveCorrecta, sesionValida, tokenSesion } from "./redes/sesion.ts";
import { LIMITE_TITULAR } from "./redes/tipos.ts";

test("convierte hora de Chile a UTC con horario de invierno y de verano", () => {
  assert.equal(desdeSantiago("2026-07-01T09:00")?.toISOString(), "2026-07-01T13:00:00.000Z");
  assert.equal(desdeSantiago("2026-12-01T09:00")?.toISOString(), "2026-12-01T12:00:00.000Z");
  assert.equal(aSantiago(new Date("2026-12-01T12:00:00Z")), "2026-12-01T09:00");
  assert.equal(desdeSantiago("mañana"), null);
});

test("la siguiente ventana cae en día hábil, a las 09:00 y sin repetir día", () => {
  const sabado = new Date("2026-10-03T15:00:00Z");
  const primera = siguienteVentana(sabado, []);
  assert.equal(aSantiago(primera), "2026-10-05T09:00");
  assert.equal(aSantiago(siguienteVentana(sabado, [primera])), "2026-10-06T09:00");
  // Si ya pasó la hora de hoy, pasa al día siguiente
  assert.equal(aSantiago(siguienteVentana(new Date("2026-10-06T20:00:00Z"), [])), "2026-10-07T09:00");
});

test("interpreta la respuesta de Claude aunque venga con texto alrededor y recorta los límites", () => {
  const b = parsearRespuesta('Aquí va:\n{"texto":" Hola ","titular":"' + "x".repeat(200) + '","bajada":"Apoyo"}', "linkedin");
  assert.equal(b.texto, "Hola");
  assert.equal(b.titular.length, LIMITE_TITULAR);
  assert.equal(b.bajada, "Apoyo");
  assert.throws(() => parsearRespuesta("sin json", "instagram"));
  assert.throws(() => parsearRespuesta('{"texto":"a"}', "instagram"));
});

test("la plantilla y la rotación de temas siempre entregan algo publicable", () => {
  assert.ok(TEMAS.includes(elegirTema(new Date("2026-10-04T00:00:00Z"))));
  const p = plantilla(TEMAS[0], "instagram");
  assert.ok(p.texto.includes("silverjob.cl") && p.titular.length <= LIMITE_TITULAR);
});

test("escapa los caracteres reservados de LinkedIn sin romper los hashtags", () => {
  assert.equal(escaparLinkedin("Plan (Estándar) #Pymes @tomas"), "Plan \\(Estándar\\) #Pymes \\@tomas");
  assert.equal(escaparLinkedin("Punto # suelto"), "Punto \\# suelto");
});

test("la sesión del panel depende de la clave", () => {
  assert.equal(sesionValida(tokenSesion("a"), "a"), true);
  assert.equal(sesionValida(tokenSesion("a"), "b"), false);
  assert.equal(sesionValida(undefined, "a"), false);
  assert.equal(sesionValida(tokenSesion("a"), undefined), false);
  assert.equal(claveCorrecta("a", "a"), true);
  assert.equal(claveCorrecta("b", "a"), false);
  assert.equal(claveCorrecta("a", undefined), false);
});
