import { NextResponse } from "next/server";
import { crearPreferencia, urlSitio } from "@/lib/mercadopago";
import { planesALaVenta } from "@/lib/planes";

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Recibe el formulario de /pagar y redirige al checkout de Mercado Pago
export async function POST(request: Request) {
  const volver = (error: string) =>
    NextResponse.redirect(`${urlSitio()}/pagar?error=${error}`, 303);

  const datos = await request.formData();
  const texto = (k: string) => String(datos.get(k) ?? "").trim().slice(0, 200);
  const plan = planesALaVenta().find((p) => p.id === texto("plan"));
  const comprador = { nombre: texto("nombre"), correo: texto("correo"), empresa: texto("empresa") };

  if (!plan) return volver("plan");
  if (!comprador.nombre || !comprador.empresa || !CORREO.test(comprador.correo)) return volver("datos");

  try {
    const { url, referencia } = await crearPreferencia(plan, comprador);
    console.info("checkout_creado", { referencia, plan: plan.id, monto: plan.precio });
    return NextResponse.redirect(url, 303);
  } catch (e) {
    console.error("checkout_error", e);
    return volver("mercadopago");
  }
}
