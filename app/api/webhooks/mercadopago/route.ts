import { NextResponse } from "next/server";
import { firmaValida } from "@/lib/firma";
import { obtenerPago } from "@/lib/mercadopago";
import { registrarPago } from "@/lib/pagos";

// Notificaciones de Mercado Pago. Se valida la firma y se consulta el pago en la API,
// sin confiar en el contenido del aviso.
export async function POST(request: Request) {
  const secreto = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secreto) {
    console.error("webhook_mp: falta MERCADOPAGO_WEBHOOK_SECRET");
    return NextResponse.json({ error: "no configurado" }, { status: 500 });
  }

  const url = new URL(request.url);
  const cuerpo = (await request.json().catch(() => ({}))) as { type?: string; data?: { id?: string | number } };
  const tipo = url.searchParams.get("type") ?? cuerpo.type;
  const dataId = url.searchParams.get("data.id") ?? (cuerpo.data?.id != null ? String(cuerpo.data.id) : null);

  const valida = firmaValida({
    firma: request.headers.get("x-signature"),
    requestId: request.headers.get("x-request-id"),
    dataId,
    secreto,
    toleranciaMs: 10 * 60_000, // rechaza avisos repetidos o con firma antigua
  });
  if (!valida) return NextResponse.json({ error: "firma inválida" }, { status: 401 });

  if (tipo !== "payment" || !dataId) return NextResponse.json({ ok: true });

  try {
    const pago = await obtenerPago(dataId);
    // Sin datos personales en los logs: el correo y la empresa quedan solo en la base de datos
    const { coincide } = await registrarPago(pago);
    console.info("pago_mp", {
      id: pago.id,
      estado: pago.status,
      detalle: pago.status_detail,
      monto: pago.transaction_amount,
      referencia: pago.external_reference,
      montoCoincide: coincide,
    });
    // Siguiente paso: avisar por correo al equipo y activar el servicio solo si
    // estado === "approved" y montoCoincide !== false.
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("webhook_mp_error", e);
    // Un 500 hace que Mercado Pago reintente el aviso
    return NextResponse.json({ error: "no se pudo consultar el pago" }, { status: 500 });
  }
}
