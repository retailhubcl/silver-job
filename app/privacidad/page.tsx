import type { Metadata } from "next";
import Encabezado from "@/components/Encabezado";
import Pie from "@/components/Pie";

export const metadata: Metadata = {
  title: "Política de privacidad | Silver Job",
  robots: { index: false },
};

export default function Privacidad() {
  return (
    <>
      <Encabezado enPortada={false} />
      <main className="simple" id="contenido" tabIndex={-1}>
        <a className="volver" href="/">Volver a Silver Job</a>
        <h1>Política de privacidad</h1>
        <p className="fecha">Última actualización: septiembre de 2026</p>

        <h2>Quién es responsable de tus datos</h2>
        <p>Silver Job, con base en Santiago de Chile. Para cualquier consulta sobre tus datos, escríbenos a <a href="mailto:tomas@silverjob.cl">tomas@silverjob.cl</a>.</p>

        <h2>Qué datos recogemos</h2>
        <p>Al sumarte a la lista te pedimos tu nombre y correo. Si eres una pyme, también el nombre de tu empresa, la gerencia que necesitas y las horas aproximadas al mes. Si eres ejecutivo, tu perfil de LinkedIn, tu área y tus años de experiencia.</p>

        <h2>Para qué los usamos</h2>
        <p>Solo para contactarte sobre Silver Job, avisarte cuando abramos y preparar los primeros matches. No vendemos ni cedemos tus datos a terceros.</p>

        <h2>Dónde se guardan</h2>
        <p>Tus datos se guardan en una planilla de Google a la que solo accede el equipo de Silver Job. Además medimos visitas al sitio de forma agregada, sin identificarte personalmente.</p>

        <h2>Pagos</h2>
        <p>Los pagos de los planes se procesan a través de Mercado Pago. Silver Job no recibe ni guarda los datos de tu tarjeta; Mercado Pago solo nos informa el estado del pago, el monto, el plan y tu correo para activar el servicio.</p>

        <h2>Tus derechos</h2>
        <p>Puedes pedir en cualquier momento acceder a tus datos, corregirlos o eliminarlos escribiendo a <a href="mailto:tomas@silverjob.cl">tomas@silverjob.cl</a>. Tratamos tus datos conforme a la legislación chilena de protección de datos personales.</p>
      </main>
      <Pie />
    </>
  );
}
