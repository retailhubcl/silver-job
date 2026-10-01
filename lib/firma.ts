import { createHmac, timingSafeEqual } from "node:crypto";

// Valida el header x-signature de los webhooks de Mercado Pago.
// https://www.mercadopago.cl/developers/es/docs/your-integrations/notifications/webhooks
export function firmaValida({
  firma,
  requestId,
  dataId,
  secreto,
}: {
  firma: string | null;
  requestId: string | null;
  dataId: string | null;
  secreto: string;
}): boolean {
  if (!firma || !dataId) return false;
  const partes = Object.fromEntries(
    firma.split(",").map((p) => {
      const [k, ...v] = p.trim().split("=");
      return [k, v.join("=")];
    }),
  );
  const ts = partes.ts;
  const v1 = partes.v1;
  if (!ts || !v1) return false;

  // Mercado Pago firma el id en minúsculas cuando es alfanumérico
  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  let manifiesto = `id:${id};`;
  if (requestId) manifiesto += `request-id:${requestId};`;
  manifiesto += `ts:${ts};`;

  const esperado = createHmac("sha256", secreto).update(manifiesto).digest("hex");
  const a = Buffer.from(esperado, "hex");
  const b = Buffer.from(v1, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
