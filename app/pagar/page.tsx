import type { Metadata } from "next";
import { formatoCLP, planesALaVenta } from "@/lib/planes";

export const metadata: Metadata = {
  title: "Contratar un plan | Silver Job",
  robots: { index: false },
};

// Los precios se leen en cada visita desde las variables de entorno
export const dynamic = "force-dynamic";

const ERRORES: Record<string, string> = {
  plan: "Elige uno de los planes disponibles.",
  datos: "Revisa tu nombre, empresa y correo.",
  mercadopago: "No pudimos iniciar el pago con Mercado Pago. Inténtalo de nuevo en unos minutos o escríbenos a tomas@silverjob.cl.",
};

export default async function Pagar({ searchParams }: { searchParams: Promise<{ plan?: string; error?: string }> }) {
  const { plan: elegido, error } = await searchParams;
  const disponibles = planesALaVenta();

  return (
    <main className="simple">
      <a className="volver" href="/">Volver a Silver Job</a>
      <h1>Contrata tu plan</h1>
      {disponibles.length === 0 ? (
        <p>Todavía no abrimos los pagos en línea. Si ya acordaste un plan con nosotros, escríbenos a <a href="mailto:tomas@silverjob.cl">tomas@silverjob.cl</a>.</p>
      ) : (
        <form method="post" action="/api/checkout">
          <p>Eliges las horas del mes y pagas con Mercado Pago. La mensualidad incluye las horas del ejecutivo.</p>
          <p className="pago-nota">Las horas de cada mes se contratan hasta el día 5 de ese mes y se usan dentro del mes contratado.</p>
          {error && ERRORES[error] && <p className="form-error" role="alert">{ERRORES[error]}</p>}
          <ul className="pago-planes">
            {disponibles.map((p, i) => (
              <li key={p.id}>
                <label>
                  <input type="radio" name="plan" value={p.id} required defaultChecked={elegido ? elegido === p.id : i === 0} />
                  <span><strong>{p.nombre}</strong><br />{p.horas}</span>
                  <span className="precio">{formatoCLP(p.precio)} al mes<small>IVA incluido</small></span>
                </label>
              </li>
            ))}
          </ul>
          <div className="pago-campos">
            <label>Nombre<input name="nombre" autoComplete="name" required maxLength={200} /></label>
            <label>Empresa<input name="empresa" autoComplete="organization" required maxLength={200} /></label>
            <label>Correo<input name="correo" type="email" autoComplete="email" required maxLength={200} /></label>
          </div>
          <button className="boton" type="submit">Pagar con Mercado Pago</button>
          <p className="pago-nota">Te llevaremos al sitio seguro de Mercado Pago. Silver Job no ve ni guarda los datos de tu tarjeta.</p>
        </form>
      )}
    </main>
  );
}
