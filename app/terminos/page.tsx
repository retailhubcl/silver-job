import type { Metadata } from "next";
import Encabezado from "@/components/Encabezado";
import Pie from "@/components/Pie";
import { DESCUENTO_ANUAL, HORAS_BLOQUE, RECARGO_BLOQUE, TRAMOS } from "@/lib/precios";

export const metadata: Metadata = {
  title: "Términos y condiciones | Silver Job",
  robots: { index: false },
};

// Versión preliminar: viene del borrador de términos (Claude Doc) ajustado a las reglas vigentes de CLAUDE.md.
// Los puntos abiertos para el abogado quedan fuera de esta página.
export default function Terminos() {
  return (
    <>
      <Encabezado enPortada={false} />
      <main className="simple" id="contenido" tabIndex={-1}>
        <a className="volver" href="/">Volver a Silver Job</a>
        <h1>Términos y condiciones</h1>
        <p className="fecha">Versión preliminar, actualizada el 9 de octubre de 2026</p>
        <p className="aviso-preliminar" role="note">
          Estos términos están en revisión legal y pueden cambiar antes de que abramos los pagos en línea. Si tienes dudas, escríbenos a{" "}
          <a href="mailto:tomas@silverjob.cl">tomas@silverjob.cl</a>.
        </p>

        <h2>1. Definiciones</h2>
        <ul>
          <li><strong>Silver Job o la plataforma:</strong> el sitio silverjob.cl y sus servicios de conexión, agenda y pagos.</li>
          <li><strong>Pyme:</strong> empresa que contrata horas de un ejecutivo a través de Silver Job.</li>
          <li><strong>Ejecutivo:</strong> profesional con experiencia gerencial que presta servicios por horas a través de Silver Job.</li>
          <li><strong>Plan:</strong> rango de horas mensuales contratadas (Básico, Estándar o Intensivo).</li>
          <li><strong>Bolsa de horas:</strong> horas contratadas por la pyme para un mes calendario.</li>
        </ul>

        <h2>2. Qué hace Silver Job</h2>
        <p>Silver Job conecta pymes con ejecutivos, coordina la agenda de sesiones y administra los pagos. No presta los servicios de gerencia ni supervisa su ejecución.</p>
        <p><strong>El alcance y los entregables del trabajo son responsabilidad de la pyme y del ejecutivo, que los acuerdan entre sí.</strong> Silver Job no responde por la calidad, los resultados ni el cumplimiento de esos servicios.</p>
        <p>El ejecutivo trabaja de forma independiente, sin relación de subordinación ni dependencia con Silver Job ni con la pyme.</p>

        <h2>3. Planes y precios</h2>
        <p>La pyme paga una mensualidad según su plan. La mensualidad es el precio hora del plan por las horas contratadas e incluye el pago al ejecutivo.</p>
        <ul>
          {TRAMOS.map((t) => (
            <li key={t.id}><strong>{t.nombre}:</strong> {t.desde === 1 ? `hasta ${t.hasta}` : `de ${t.desde} a ${t.hasta}`} horas al mes.</li>
          ))}
        </ul>
        <p>Los precios vigentes se publican en silverjob.cl e incluyen IVA. La mensualidad de un plan nunca es menor que el máximo del plan anterior.</p>
        <p>La pyme puede pagar un plan anual: 12 mensualidades por adelantado con {DESCUENTO_ANUAL * 100}% de descuento.</p>
        <p>Silver Job no cobra matrícula, fee de conexión ni comisiones adicionales, ni a la pyme ni al ejecutivo.</p>

        <h2>4. Contratación y bolsa de horas</h2>
        <p>Las horas de cada mes se contratan hasta el día 5 de ese mes. Pasado ese plazo, la contratación rige desde el mes siguiente.</p>
        <p>La bolsa de horas se usa dentro del mes contratado. Las horas que no se usen no pasan al mes siguiente ni se reembolsan, salvo el crédito por horas que el ejecutivo no entregó (sección 6).</p>
        <p>Si la pyme necesita más horas en un mes, puede comprar bloques de {HORAS_BLOQUE} horas con un recargo de {RECARGO_BLOQUE * 100}% sobre el precio hora de su plan, para usar en ese mismo mes.</p>

        <h2>5. Pagos</h2>
        <p>Todos los pagos entre la pyme y el ejecutivo se hacen a través de Silver Job. Las partes no pueden pagarse directamente por servicios que nacieron de una conexión hecha en Silver Job.</p>
        <ul>
          <li>La pyme paga por adelantado, al contratar, a través de Mercado Pago.</li>
          <li>Silver Job le paga al ejecutivo a fin de mes su valor hora completo por las horas trabajadas y registradas como realizadas en la agenda.</li>
          <li>El ejecutivo emite su documento tributario por el monto de cada mes.</li>
        </ul>

        <h2>6. Agenda, cancelaciones y créditos</h2>
        <p>Las sesiones se coordinan en la agenda de Silver Job, que registra solo fechas, horarios y el estado de cada sesión, no su contenido. Una cancelación válida requiere al menos 24 horas de aviso.</p>
        <ul>
          <li><strong>La pyme cancela con 24 horas o más:</strong> puede reagendar la sesión, con un máximo de un reagendamiento al mes.</li>
          <li><strong>La pyme cancela con menos de 24 horas, o ya usó su reagendamiento:</strong> la hora se descuenta de su bolsa y se le paga al ejecutivo.</li>
          <li><strong>El ejecutivo cancela o no se presenta:</strong> la hora no se le paga y queda como crédito para la pyme en el mes siguiente.</li>
        </ul>

        <h2>7. Evaluaciones</h2>
        <p>La pyme evalúa al ejecutivo con 1 a 5 lingotes, y el ejecutivo evalúa a la pyme.</p>
        <ul>
          <li><strong>Sello Plata certificada:</strong> lo obtiene el ejecutivo con un promedio de 4,5 lingotes o más, al menos 3 meses de trabajo en Silver Job y 10 evaluaciones como mínimo. Se revisa cada trimestre.</li>
          <li><strong>Evaluación de la pyme:</strong> es de uso interno de Silver Job y no se muestra a otros usuarios.</li>
        </ul>

        <h2>8. Datos y confidencialidad</h2>
        <p>Silver Job trata solo los datos necesarios para conectar, agendar y pagar, como explica la <a href="/privacidad">política de privacidad</a>. Los datos de demanda de horas se usan de forma agregada y anónima. Lo que la pyme comparta con el ejecutivo es confidencial entre ellos.</p>

        <h2>9. Cambios a estos términos</h2>
        <p>Silver Job puede actualizar estos términos. La versión vigente se publica en esta página con su fecha.</p>
      </main>
      <Pie />
    </>
  );
}
