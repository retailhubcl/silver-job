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
        <p className="fecha">Última actualización: octubre de 2026</p>

        <h2>Quién es responsable de tus datos</h2>
        <p>Silver Job, con base en Santiago de Chile. Para cualquier consulta sobre tus datos, escríbenos a <a href="mailto:tomas@silverjob.cl">tomas@silverjob.cl</a>.</p>

        <h2>Qué datos recogemos</h2>
        <p>Al sumarte a la lista te pedimos tu nombre y correo. Si eres una pyme, también el nombre de tu empresa, la gerencia que necesitas y las horas aproximadas al mes. Si eres ejecutivo, tu perfil de LinkedIn, tu área y tus años de experiencia. Guardamos además la fecha del registro y la versión de esta política que aceptaste.</p>

        <h2>Para qué los usamos y con qué base</h2>
        <p>Solo para contactarte sobre Silver Job, avisarte cuando abramos y preparar los primeros matches. La base es tu consentimiento, que das al marcar la casilla del formulario y puedes retirar cuando quieras. No vendemos ni cedemos tus datos a terceros.</p>

        <h2>Dónde se guardan y quién los trata</h2>
        <p>Los datos de la lista de espera y de los pagos se guardan en una base de datos de Supabase, ubicada en São Paulo (Brasil), con acceso restringido al equipo de Silver Job y cifrado en reposo. El sitio funciona en Vercel (Estados Unidos). Estos proveedores tratan los datos por encargo nuestro y bajo sus propias medidas de seguridad, por lo que tus datos pueden procesarse fuera de Chile. Además medimos visitas al sitio de forma agregada, sin identificarte personalmente.</p>

        <h2>Pagos</h2>
        <p>Los pagos de los planes se procesan a través de Mercado Pago. Silver Job no recibe ni guarda los datos de tu tarjeta; Mercado Pago solo nos informa el estado del pago, el monto, el plan y tu correo para activar el servicio. Conservamos el registro de los pagos el tiempo que exige la normativa tributaria.</p>

        <h2>Cuánto tiempo los conservamos</h2>
        <p>Los datos de la lista de espera se eliminan a los 12 meses de tu registro, salvo que te hayas convertido en cliente o ejecutivo de la plataforma, o que nos pidas antes que los borremos.</p>

        <h2>Cómo los protegemos</h2>
        <p>Usamos conexiones cifradas, accesos con verificación en dos pasos, claves separadas por entorno, validación de lo que se envía por el formulario y protección contra envíos automatizados. Si ocurriera una brecha que afecte tus datos, te lo informaremos a la brevedad y daremos aviso a la autoridad de protección de datos cuando corresponda.</p>

        <h2>Tus derechos</h2>
        <p>Puedes pedir en cualquier momento acceder a tus datos, corregirlos, eliminarlos, oponerte a su uso, bloquearlos o llevártelos, escribiendo a <a href="mailto:tomas@silverjob.cl">tomas@silverjob.cl</a>. Respondemos en un plazo máximo de 30 días. Tratamos tus datos conforme a la legislación chilena de protección de datos personales.</p>
      </main>
      <Pie />
    </>
  );
}
