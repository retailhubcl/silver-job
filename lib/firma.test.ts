import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { firmaValida } from "./firma.ts";
import { leerPrecio, planes, planesALaVenta } from "./planes.ts";

const secreto = "secreto-de-prueba";
const firmar = (manifiesto: string) => createHmac("sha256", secreto).update(manifiesto).digest("hex");

test("acepta una firma correcta", () => {
  const v1 = firmar("id:123456;request-id:abc-1;ts:1700000000;");
  assert.equal(firmaValida({ firma: `ts=1700000000,v1=${v1}`, requestId: "abc-1", dataId: "123456", secreto }), true);
});

test("usa el id en minúsculas cuando es alfanumérico", () => {
  const v1 = firmar("id:abc123;request-id:r;ts:1;");
  assert.equal(firmaValida({ firma: `ts=1,v1=${v1}`, requestId: "r", dataId: "ABC123", secreto }), true);
});

test("rechaza firmas alteradas o incompletas", () => {
  const v1 = firmar("id:1;request-id:r;ts:1;");
  assert.equal(firmaValida({ firma: `ts=1,v1=${v1}`, requestId: "r", dataId: "2", secreto }), false);
  assert.equal(firmaValida({ firma: `ts=1,v1=zz`, requestId: "r", dataId: "1", secreto }), false);
  assert.equal(firmaValida({ firma: null, requestId: "r", dataId: "1", secreto }), false);
  assert.equal(firmaValida({ firma: `v1=${v1}`, requestId: "r", dataId: "1", secreto }), false);
});

test("lee precios en CLP y descarta valores inválidos", () => {
  assert.equal(leerPrecio("490000"), 490000);
  assert.equal(leerPrecio("$1.490.000"), 1490000);
  assert.equal(leerPrecio("abc"), null);
  assert.equal(leerPrecio("0"), null);
  assert.equal(leerPrecio(undefined), null);
});

test("solo vende planes con precio", () => {
  const env = { PRECIO_PLAN_ESTANDAR: "1500000" };
  assert.equal(planes(env).length, 3);
  assert.deepEqual(planesALaVenta(env).map((p) => p.id), ["estandar"]);
});
