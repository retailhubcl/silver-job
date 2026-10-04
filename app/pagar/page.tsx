import type { Metadata } from "next";
import Encabezado from "@/components/Encabezado";
import Pie from "@/components/Pie";
import { CotizadorBloques, CotizadorPlan } from "@/components/Cotizador";
import { pagosHabilitados } from "@/lib/mercadopago";
import { esHorasValidas } from "@/lib/precios";

export const metadata: Metadata = {
  title: "Contratar un plan | Silver Job",
  robots: { index: false },
};

// Se decide en cada visita si los pagos están habilitados
export const dynamic = "force-dynamic";

const ERRORES: Record<string, string> = {
  plan: "Revisa la gerencia, las horas o los bloques que elegiste.",
  datos: "Revisa tu nombre, empresa y correo.",
  mercadopago: "No pudimos iniciar el pago con Mercado Pago. Inténtalo de nuevo en unos minutos o escríbenos a tomas@silverjob.cl.",
};

export default async function Pagar({ searchParams }: { searchParams: Promise<{ tipo?: string; horas?: string; error?: string }> }) {
  const { tipo, horas, error } = await searchParams;
  const bloques = tipo === "bloque";
  const horasIniciales = esHorasValidas(Number(horas)) ? Number(horas) : 18;

  return (
    <>
      <Encabezado enPortada={false} />
      <main className="simple" id="contenido" tabIndex={-1}>
        <a className="volver" href="/">Volver a Silver Job</a>
        <h1>{bloques ? "Suma horas a tu plan" : "Contrata tu plan"}</h1>
        {!pagosHabilitados() ? (
          <p>Todavía no abrimos los pagos en línea. Si ya acordaste un plan con nosotros, escríbenos a <a href="mailto:tomas@silverjob.cl">tomas@silverjob.cl</a>.</p>
        ) : (
          <>
            <p>
              {bloques
                ? "Compra bloques de 5 horas para usar este mes, sin cambiar de plan."
                : "Eliges la gerencia y las horas del mes, y pagas por adelantado con Mercado Pago. La mensualidad incluye las horas del ejecutivo, sin matrícula, comisiones ni otros cobros."}
            </p>
            <p className="pago-nota">
              Las horas de cada mes se contratan hasta el día 5 de ese mes y se usan dentro del mes contratado. Todos los precios incluyen IVA.
            </p>
            <p className="pago-nota">
              {bloques ? <a href="/pagar">¿Quieres contratar un plan?</a> : <a href="/pagar?tipo=bloque">¿Ya tienes un plan y necesitas más horas?</a>}
            </p>
            {error && ERRORES[error] && <p className="form-error" role="alert">{ERRORES[error]}</p>}
            {bloques ? <CotizadorBloques /> : <CotizadorPlan horasIniciales={horasIniciales} />}
            <p className="pago-nota">Te llevaremos al sitio seguro de Mercado Pago. Silver Job no ve ni guarda los datos de tu tarjeta.</p>
          </>
        )}
      </main>
      <Pie />
    </>
  );
}
