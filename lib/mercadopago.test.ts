import { test } from "node:test";
import assert from "node:assert/strict";
import { crearPreferencia } from "./mercadopago.ts";
import { cotizarPlan } from "./precios.ts";

test("la preferencia lleva una línea por concepto, en CLP y con los montos de la cotización", async () => {
  process.env.MERCADOPAGO_ACCESS_TOKEN = "TEST-token";
  process.env.NEXT_PUBLIC_SITE_URL = "https://silverjob.cl";
  let enviado: any;
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    enviado = JSON.parse(String(init.body));
    return new Response(JSON.stringify({ id: "pref-1", init_point: "https://mp/checkout" }), { status: 201 });
  }) as typeof fetch;

  const cotizacion = cotizarPlan({ gerencia: "general", horas: 27, modalidad: "mensual" });
  const r = await crearPreferencia(cotizacion, { nombre: "Ana", correo: "ana@pyme.cl", empresa: "Pyme SpA" }, { tipo: "plan", horas: 27 });

  assert.equal(r.url, "https://mp/checkout");
  assert.deepEqual(enviado.items.map((i: any) => [i.unit_price, i.currency_id, i.quantity]), [[3_094_000, "CLP", 1]]);
  assert.equal(enviado.notification_url, "https://silverjob.cl/api/webhooks/mercadopago");
  assert.equal(enviado.metadata.empresa, "Pyme SpA");
  assert.match(enviado.external_reference, /^plan:/);
});
