import type { Cotizacion } from "./precios";

const API = "https://api.mercadopago.com";

function token() {
  const t = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!t) throw new Error("Falta MERCADOPAGO_ACCESS_TOKEN");
  return t;
}

export function pagosHabilitados() {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

export function urlSitio() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://silverjob.cl").replace(/\/$/, "");
}

export interface Comprador {
  nombre: string;
  correo: string;
  empresa: string;
}

// Crea una preferencia de Checkout Pro y devuelve la URL de pago.
// Los montos vienen de una cotización calculada en el servidor.
export async function crearPreferencia(
  cotizacion: Cotizacion,
  comprador: Comprador,
  metadata: Record<string, string | number | boolean>,
) {
  const sitio = urlSitio();
  const referencia = `${metadata.tipo}:${crypto.randomUUID()}`;
  const respuesta = await fetch(`${API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": referencia,
    },
    body: JSON.stringify({
      items: cotizacion.lineas.map((l) => ({
        id: l.id,
        title: `Silver Job: ${l.concepto}`,
        quantity: 1,
        unit_price: l.monto,
        currency_id: "CLP",
      })),
      payer: { name: comprador.nombre, email: comprador.correo },
      external_reference: referencia,
      metadata: { ...metadata, empresa: comprador.empresa },
      back_urls: {
        success: `${sitio}/pago/exito`,
        pending: `${sitio}/pago/pendiente`,
        failure: `${sitio}/pago/error`,
      },
      auto_return: "approved",
      notification_url: `${sitio}/api/webhooks/mercadopago`,
      statement_descriptor: "SILVERJOB",
    }),
  });
  if (!respuesta.ok) {
    throw new Error(`Mercado Pago respondió ${respuesta.status}: ${await respuesta.text()}`);
  }
  const preferencia = (await respuesta.json()) as { id: string; init_point: string };
  return { id: preferencia.id, url: preferencia.init_point, referencia };
}

export interface PagoMP {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  external_reference: string | null;
  payer?: { email?: string };
  metadata?: Record<string, unknown>;
}

export async function obtenerPago(id: string): Promise<PagoMP> {
  const respuesta = await fetch(`${API}/v1/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token()}` },
    cache: "no-store",
  });
  if (!respuesta.ok) throw new Error(`No se pudo leer el pago ${id}: ${respuesta.status}`);
  return respuesta.json();
}
