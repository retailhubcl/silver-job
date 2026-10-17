import { TRAMOS, cotizarBloques, cotizarPlan, esHorasValidas, type Gerencia } from "./precios.ts";
import { supabaseActivo, upsert } from "./supabase.ts";
import type { PagoMP } from "./mercadopago.ts";

// Monto que debía pagarse según la metadata guardada al crear la preferencia.
// Se recalcula con los precios vigentes; null si la metadata no sirve para calcularlo.
export function montoEsperado(metadata: Record<string, unknown> | undefined): number | null {
  if (!metadata) return null;
  const gerencia = metadata.gerencia as Gerencia;
  if (gerencia !== "general" && gerencia !== "otras") return null;
  try {
    if (metadata.tipo === "bloque") {
      const tramo = TRAMOS.find((t) => t.id === metadata.tramo);
      const cantidad = Number(metadata.bloques);
      if (!tramo || !Number.isInteger(cantidad) || cantidad < 1) return null;
      return cotizarBloques({ gerencia, tramo, cantidad }).total;
    }
    if (metadata.tipo === "plan") {
      const horas = Number(metadata.horas);
      if (!esHorasValidas(horas)) return null;
      const modalidad = metadata.modalidad === "anual" ? "anual" : "mensual";
      return cotizarPlan({ gerencia, horas, modalidad }).total;
    }
  } catch {
    return null;
  }
  return null;
}

export interface PagoRegistrado {
  coincide: boolean | null;
  esperado: number | null;
}

// Verifica el monto y guarda el pago (idempotente por payment_id). Lanza error si hay base
// configurada y falla el guardado, para que Mercado Pago reintente el aviso.
export async function registrarPago(pago: PagoMP): Promise<PagoRegistrado> {
  const esperado = montoEsperado(pago.metadata);
  const coincide = esperado === null ? null : Math.round(pago.transaction_amount) === esperado;
  if (coincide === false) {
    console.error("pago_monto_distinto", { id: pago.id, estado: pago.status, pagado: pago.transaction_amount, esperado });
  }
  if (supabaseActivo()) {
    const m = pago.metadata ?? {};
    await upsert(
      "pagos",
      {
        payment_id: pago.id,
        referencia: pago.external_reference,
        estado: pago.status,
        detalle: pago.status_detail,
        monto: Math.round(pago.transaction_amount),
        monto_esperado: esperado,
        monto_coincide: coincide,
        moneda: "CLP",
        tipo: typeof m.tipo === "string" ? m.tipo : null,
        correo: pago.payer?.email ?? null,
        empresa: typeof m.empresa === "string" ? m.empresa : null,
        metadata: m,
      },
      "payment_id",
    );
  } else {
    console.warn("pagos_sin_base: configura SUPABASE_URL y SUPABASE_SECRET_KEY para guardar los pagos");
  }
  return { coincide, esperado };
}
