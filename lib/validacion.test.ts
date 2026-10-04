import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizarLinkedin, validarRegistro } from "./validacion.ts";

const pyme = { nombre: "Ana", correo: "ana@pyme.cl", empresa: "Pyme SpA", area: "Finanzas", horas: "Hasta 10 (Básico)", consentimiento: "si" };
const ejecutivo = { nombre: "Luis", correo: "luis@correo.cl", linkedin: "https://linkedin.com/in/luis", area: "Operaciones", anios: "Más de 30", consentimiento: "si" };

test("un registro completo no tiene errores", () => {
  assert.deepEqual(validarRegistro(pyme, "pyme"), {});
  assert.deepEqual(validarRegistro(ejecutivo, "ejecutivo"), {});
});

test("un formulario vacío marca cada campo con su mensaje", () => {
  assert.deepEqual(Object.keys(validarRegistro({}, "pyme")), ["nombre", "correo", "empresa", "area", "horas", "consentimiento"]);
  assert.deepEqual(Object.keys(validarRegistro({}, "ejecutivo")), ["nombre", "correo", "linkedin", "area", "anios", "consentimiento"]);
});

test("el correo exige un dominio con punto", () => {
  assert.match(validarRegistro({ ...pyme, correo: "ana@pyme" }, "pyme").correo ?? "", /nombre@empresa\.cl/);
  assert.ok(validarRegistro({ ...pyme, correo: "ana pyme.cl" }, "pyme").correo);
  assert.equal(validarRegistro({ ...pyme, correo: " ana@pyme.cl " }, "pyme").correo, undefined);
});

test("LinkedIn debe ser un perfil", () => {
  assert.ok(validarRegistro({ ...ejecutivo, linkedin: "https://linkedin.com/company/x" }, "ejecutivo").linkedin);
  assert.ok(validarRegistro({ ...ejecutivo, linkedin: "https://linkedin.com/in/" }, "ejecutivo").linkedin);
  assert.equal(normalizarLinkedin(" linkedin.com/in/luis "), "https://linkedin.com/in/luis");
  assert.equal(normalizarLinkedin("https://www.linkedin.com/in/luis"), "https://www.linkedin.com/in/luis");
});

test("sin consentimiento no se envía", () => {
  assert.ok(validarRegistro({ ...pyme, consentimiento: undefined }, "pyme").consentimiento);
});
