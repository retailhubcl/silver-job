import { NextResponse } from "next/server";
import { crearPreferencia, urlSitio } from "@/lib/mercadopago";
import { TRAMOS, cotizarBloques, cotizarPlan, esHorasValidas, type Gerencia } from "@/lib/precios";

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BLOQUES_MAX = 4;

// Recibe el formulario de /pagar, recalcula el monto y redirige al checkout de Mercado Pago
export async function POST(request: Request) {
  const datos = await request.formData();
  const texto = (k: string) => String(datos.get(k) ?? "").trim().slice(0, 200);
  const tipo = texto("tipo") === "bloque" ? "bloque" : "plan";
  const volver = (error: string) =>
    NextResponse.redirect(`${urlSitio()}/pagar?${tipo === "bloque" ? "tipo=bloque&" : ""}error=${error}`, 303);

  const gerencia = texto("gerencia") as Gerencia;
  const comprador = { nombre: texto("nombre"), correo: texto("correo"), empresa: texto("empresa") };
  if (gerencia !== "general" && gerencia !== "otras") return volver("plan");
  if (!comprador.nombre || !comprador.empresa || !CORREO.test(comprador.correo)) return volver("datos");
  if (texto("terminos") !== "si") return volver("terminos");

  let cotizacion;
  let metadata: Record<string, string | number | boolean>;
  if (tipo === "bloque") {
    const tramo = TRAMOS.find((t) => t.id === texto("tramo"));
    const cantidad = Number(texto("cantidad"));
    if (!tramo || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > BLOQUES_MAX) return volver("plan");
    cotizacion = cotizarBloques({ gerencia, tramo, cantidad });
    metadata = { tipo, gerencia, tramo: tramo.id, bloques: cantidad, terminos: "preliminar-2026-10-09" };
  } else {
    const horas = Number(texto("horas"));
    if (!esHorasValidas(horas)) return volver("plan");
    const modalidad = texto("modalidad") === "anual" ? "anual" : "mensual";
    cotizacion = cotizarPlan({ gerencia, horas, modalidad });
    metadata = { tipo, gerencia, horas, modalidad, terminos: "preliminar-2026-10-09" };
  }

  try {
    const { url, referencia } = await crearPreferencia(cotizacion, comprador, metadata);
    console.info("checkout_creado", { referencia, ...metadata, total: cotizacion.total });
    return NextResponse.redirect(url, 303);
  } catch (e) {
    console.error("checkout_error", e);
    return volver("mercadopago");
  }
}
