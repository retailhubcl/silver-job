import type { Metadata } from "next";
import Image from "next/image";
import Anillo from "@/components/Anillo";
import CalendarioPatricia from "@/components/CalendarioPatricia";
import Encabezado from "@/components/Encabezado";
import EnlaceRegistro from "@/components/EnlaceRegistro";
import FormularioLista from "@/components/FormularioLista";
import GuiaPlan from "@/components/GuiaPlan";
import { HORAS_MAX, TRAMOS, formatoCLP, mensualidad, type IdTramo } from "@/lib/precios";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const EJEMPLO = { horas: 18, ...mensualidad("otras", 18) };

const USO_TRAMO: Record<IdTramo, string> = {
  basico: "Para ordenar un tema puntual o tener una segunda opinión experta.",
  estandar: "Para liderar un área con presencia todas las semanas.",
  intensivo: "Para una etapa de cambio fuerte o un proyecto de crecimiento.",
};

export default function Inicio() {
  return (
    <>
      <svg width="0" height="0" style={{ "position": "absolute" }} aria-hidden="true"><defs><linearGradient id="plata-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F7F8FA" /><stop offset=".55" stopColor="#C9D0D7" /><stop offset="1" stopColor="#8E99A5" /></linearGradient></defs></svg>

      <Encabezado />

      <div className="oscuro">
        <div className="fondo-anillo"><Anillo /></div>

        <section className="hero">
          <div className="contenedor">
            <div>
              <h1>La experiencia<br />no se jubila.</h1>
              <p className="bajada">Gerentes senior que ya hicieron crecer empresas, ahora por horas para pymes que quieren llegar más lejos.</p>
              <div className="acciones">
                <EnlaceRegistro className="boton plata" tipo="pyme">Súmate como pyme</EnlaceRegistro>
                <EnlaceRegistro className="boton contorno" tipo="ejecutivo">Súmate como ejecutivo</EnlaceRegistro>
              </div>
            </div>

            <figure className="foto-hero">
              <Image src="/img/patricia-vina.jpg" width={900} height={1117} preload fetchPriority="high" sizes="(max-width: 900px) min(calc(100vw - 2.5rem), 30rem), 480px" alt="Patricia, ejecutiva de pelo plateado, de pie en la sala de barricas de una viña familiar" />
              <figcaption><Anillo /><span><strong>Patricia, ex gerenta de operaciones.</strong> Hoy asesora a tres pymes, 60 horas al mes.</span></figcaption>
            </figure>
          </div>
        </section>
      </div>

      <main>
        <section className="puente" aria-label="Por qué existe Silver Job">
          <div className="anillo-enorme"><Anillo /></div>
          <div className="contenedor">
            <div className="lados-frase">
              <p className="frase izq">Hay <b>pymes</b> que crecieron más rápido que su equipo de gestión.</p>
              <div className="union"><Anillo /></div>
              <p className="frase">Y <b>ejecutivos</b> con décadas de experiencia, listos para su próximo desafío.</p>
            </div>
            <p className="cierre">Silver Job junta a los dos.</p>
          </div>
        </section>


        <section className="patricia" aria-labelledby="patricia-titulo">
          <div className="contenedor">
            <div className="patricia-intro">
              <h2 id="patricia-titulo">Tres pymes, una misma gerenta</h2>
              <p>Patricia fue gerenta de operaciones durante décadas. Hoy reparte su experiencia entre tres empresas que nunca habrían podido contratarla a tiempo completo.</p>
            </div>
            <div className="patricia-grid">
              <figure className="mes" aria-labelledby="mes-titulo">
              <h2 id="mes-titulo">El calendario de Patricia</h2>
              <p className="nota">Caso ilustrativo. Cada bloque es una mañana de trabajo de 4 horas.</p>
              <CalendarioPatricia />
              <ul className="leyenda">
                <li><span className="muestra" style={{ "background": "var(--vino)" }}></span><div><strong>Viña familiar</strong><span className="foco">Ordenar la operación de exportación</span></div><span className="horas">24 h</span></li>
                <li><span className="muestra" style={{ "background": "var(--trigo)" }}></span><div><strong>Panadería con tres locales</strong><span className="foco">Control de costos y turnos</span></div><span className="horas">20 h</span></li>
                <li><span className="muestra" style={{ "background": "var(--tinta)" }}></span><div><strong>Empresa de transportes</strong><span className="foco">Rutas y gestión de flota</span></div><span className="horas">16 h</span></li>
              </ul>
              <div className="total"><span>Tres pymes, una misma gerenta</span><strong>60 h al mes</strong></div>
            </figure>
              <div className="fotos">
                <figure className="foto-caso">
                  <Image src="/img/patricia-panaderia.jpg" width={1100} height={738} sizes="(max-width: 900px) calc(100vw - 2.5rem), 620px" alt="Patricia revisa costos en una tablet junto al dueño de una panadería de barrio" />
                  <figcaption><span className="punto" style={{ "background": "var(--trigo)" }}></span><strong>Panadería con tres locales</strong><span>20 h al mes</span></figcaption>
                </figure>
                <figure className="foto-caso">
                  <Image src="/img/patricia-transportes.jpg" width={1100} height={738} sizes="(max-width: 900px) calc(100vw - 2.5rem), 620px" alt="Patricia muestra una ruta en una tablet a la jefa de operaciones de una empresa de transportes" />
                  <figcaption><span className="punto" style={{ "background": "var(--tinta)" }}></span><strong>Empresa de transportes</strong><span>16 h al mes</span></figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        <section className="seccion-pymes" id="pymes" aria-labelledby="pymes-titulo">
          <div className="contenedor">
            <div className="beneficios-grid">
              <div className="beneficios-intro">
                <p className="etiqueta-seccion">Para pymes</p>
                <h2 id="pymes-titulo">Gestión senior sin un sueldo de gerente a tiempo completo</h2>
                <p>La mayoría de las pymes no necesita un gerente cuarenta horas a la semana. Necesita a alguien que ya resolvió estos problemas y que dedique a tu empresa el tiempo justo.</p>
                <ul className="roles" aria-label="Áreas disponibles"><li>Gerencia general</li><li>Operaciones</li><li>Marketing</li><li>Finanzas</li><li>Comercial</li></ul>
                <EnlaceRegistro className="boton" tipo="pyme">Súmate como pyme</EnlaceRegistro>
              </div>
              <ul className="beneficios">
                <li><h3>Experiencia que antes no estaba a tu alcance</h3><p>Gerentes con décadas de trayectoria, del mismo nivel que contratan las grandes empresas.</p></li>
                <li><h3>Horas, no sueldos</h3><p>Defines cuántas horas al mes necesitas y por cuánto tiempo. Si la necesidad cambia, ajustas.</p></li>
                <li><h3>Directo a lo importante</h3><p>Alguien que ya enfrentó estos problemas no necesita meses para entender tu negocio.</p></li>
                <li><h3>Perfiles validados y evaluados</h3><p>Revisamos la trayectoria de cada ejecutivo, y las pymes lo evalúan con lingotes de plata. Los mejor evaluados llevan el sello Plata certificada.</p></li>
              </ul>
            </div>
            <div className="comparacion">
              <h3>Lo que cuesta la gerencia de operaciones, a tiempo completo o por horas</h3>
              <div className="barras" role="img" aria-label="Un gerente de operaciones a tiempo completo cuesta entre 6,7 y 9,8 millones de pesos al mes. Un plan Estándar de Silver Job de 18 horas costaría cerca de 1,5 millones al mes, más IVA.">
                <div className="fila-barra"><span className="etq">Gerente a tiempo completo</span><div className="pista"><div className="barra-costo completo"></div></div><span className="monto">$6,7 a $9,8 millones al mes</span></div>
                <div className="fila-barra"><span className="etq">Silver Job, plan Estándar de 18 horas</span><div className="pista"><div className="barra-costo silver"></div></div><span className="monto">Cerca de $1,5 millones + IVA al mes</span></div>
              </div>
              <p className="fuente">Sueldo según la guía salarial de Robert Half para Chile. El valor de Silver Job es referencial: 18 horas del plan Estándar sin IVA, con una mezcla de gerencias.</p>
            </div>
            <div className="como-funciona">
              <h3>Cómo funciona para tu pyme</h3>
              <ol className="pasos">
                <li><h4>Cuéntanos qué necesitas</h4><p>Qué área quieres ordenar, cuántas horas al mes y por cuánto tiempo.</p></li>
                <li><h4>Revisa perfiles validados</h4><p>Te presentamos ejecutivos con trayectoria real en esa área, listos para trabajar por horas.</p></li>
                <li><h4>Elige tu plan y agenda</h4><p>Contratas las horas del mes y agendas cada sesión en la plataforma. Si la necesidad crece, sumas horas.</p></li>
              </ol>
            </div>
          </div>
        </section>

        <section className="planes" id="planes" aria-labelledby="planes-titulo">
          <div className="contenedor">
            <div className="planes-intro">
              <h2 id="planes-titulo">Planes por horas al mes</h2>
              <p>Eliges cuántas horas de gerencia necesitas. La mensualidad incluye las horas del ejecutivo, sin cobros aparte.</p>
            </div>
            <ol className="regla" aria-label="Tramos de horas mensuales, de 0 a 40 horas">
              {TRAMOS.map((t) => (
                <li key={t.id} className="tramo" style={{ "--w": `${(t.hasta / HORAS_MAX) * 100}%` } as React.CSSProperties}>
                  <div className="barra"></div>
                  <span className="tope">{t.hasta} h</span>
                  <h3>{t.nombre}</h3>
                  <p className="rango">{t.desde === 1 ? `Hasta ${t.hasta}` : `De ${t.desde} a ${t.hasta}`} horas al mes</p>
                  <p>{USO_TRAMO[t.id]}</p>
                  <dl className="precio-hora">
                    <div><dt>Gerente General</dt><dd>{formatoCLP(t.precioHora.general)}</dd></div>
                    <div><dt>Otras gerencias</dt><dd>{formatoCLP(t.precioHora.otras)}</dd></div>
                  </dl>
                </li>
              ))}
            </ol>
            <p className="planes-precio">Precio por hora, IVA incluido. La mensualidad es el precio hora de tu tramo por las horas que contratas. Otras gerencias: Operaciones, Marketing, Finanzas y Comercial.</p>
            <div className="planes-ejemplo">
              <p><span>Ejemplo</span> {EJEMPLO.horas} horas de Operaciones en el plan {EJEMPLO.tramo.nombre}: <strong>{formatoCLP(EJEMPLO.monto)} al mes</strong>, IVA incluido.</p>
              <EnlaceRegistro className="boton" tipo="pyme">Súmate con este plan</EnlaceRegistro>
            </div>
            <GuiaPlan />
            <ul className="reglas-plan">
              <li><strong>Contratas hasta el día 5</strong><span>Las horas de cada mes se contratan hasta el día 5 de ese mes.</span></li>
              <li><strong>Horas del mes</strong><span>La bolsa de horas se usa dentro del mes contratado.</span></li>
              <li><strong>¿Necesitas más?</strong><span>Suma bloques de 5 horas sin cambiar de plan, con un recargo de 10% sobre el precio hora de tu tramo.</span></li>
                <li><strong>Plan anual</strong><span>Paga 12 meses por adelantado y obtén 10% de descuento.</span></li>
              <li><strong>Un solo pago</strong><span>Pagas a Silver Job y nosotros le pagamos al ejecutivo. Al concretar el match hay un fee único de $150.000.</span></li>
            </ul>
          </div>
        </section>

        <section className="seccion-ejecutivos" id="ejecutivos" aria-labelledby="ejecutivos-titulo">
          <div className="contenedor">
            <div className="beneficios-grid">
              <div className="beneficios-intro">
                <p className="etiqueta-seccion">Para ejecutivos</p>
                <Image className="foto-ejecutivo" src="/img/ejecutivo.jpg" width={1100} height={738} sizes="(max-width: 900px) min(calc(100vw - 2.5rem), 32rem), 512px" alt="Ejecutivo de barba canosa sonríe mientras trabaja en su notebook en un espacio de coworking" />
                <h2 id="ejecutivos-titulo">Tu trayectoria, donde más se necesita</h2>
                <p>Trabaja por horas con varias pymes a la vez y arma tu propia cartera de clientes, con proyectos donde tu trayectoria marca la diferencia desde el primer día.</p>
                <EnlaceRegistro className="boton plata" tipo="ejecutivo">Súmate como ejecutivo</EnlaceRegistro>
                <p className="costo-ejecutivo">Crear tu perfil es gratis. Solo pagas un fee único cuando se concreta un match con una pyme.</p>
              </div>
              <ul className="beneficios">
                <li><h3>Haz lo que mejor sabes</h3><p>Proyectos concretos donde décadas de gestión son exactamente lo que se necesita.</p></li>
                <li><h3>Arma tu propia cartera</h3><p>Trabaja con varias pymes a la vez, sin depender de un solo empleador.</p></li>
                <li><h3>Tú decides cuánto trabajar</h3><p>Eliges las horas que tienes disponibles y los proyectos que tomas.</p></li>
                <li><h3>Cobra sin perseguir pagos</h3><p>Silver Job te paga a fin de mes por las horas que trabajaste.</p></li>
              </ul>
            </div>
            <div className="sello">
              <svg className="lingote lingote-grande" viewBox="0 0 40 24" aria-hidden="true"><polygon points="7,3 33,3 39,21 1,21" fill="url(#plata-grad)" stroke="#7D8894" strokeWidth="1" strokeLinejoin="round" /><line x1="9" y1="6.5" x2="31" y2="6.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity=".9" /></svg>
              <div>
                <h3>Plata certificada</h3>
                <p>Cada pyme evalúa tu trabajo con lingotes, de uno a cinco. Con un promedio de 4,5 o más, tres meses de trabajo y diez evaluaciones, recibes el sello Plata certificada, que destaca tu perfil. El sello se revisa cada trimestre.</p>
              </div>
              <div className="nota-lingotes" role="img" aria-label="Ejemplo de evaluación: 4,8 de 5 lingotes">
                <div className="fila"><svg className="lingote" viewBox="0 0 40 24" aria-hidden="true"><polygon points="7,3 33,3 39,21 1,21" fill="url(#plata-grad)" stroke="#7D8894" strokeWidth="1.2" strokeLinejoin="round" /><line x1="9" y1="6.5" x2="31" y2="6.5" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" opacity=".9" /></svg><svg className="lingote" viewBox="0 0 40 24" aria-hidden="true"><polygon points="7,3 33,3 39,21 1,21" fill="url(#plata-grad)" stroke="#7D8894" strokeWidth="1.2" strokeLinejoin="round" /><line x1="9" y1="6.5" x2="31" y2="6.5" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" opacity=".9" /></svg><svg className="lingote" viewBox="0 0 40 24" aria-hidden="true"><polygon points="7,3 33,3 39,21 1,21" fill="url(#plata-grad)" stroke="#7D8894" strokeWidth="1.2" strokeLinejoin="round" /><line x1="9" y1="6.5" x2="31" y2="6.5" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" opacity=".9" /></svg><svg className="lingote" viewBox="0 0 40 24" aria-hidden="true"><polygon points="7,3 33,3 39,21 1,21" fill="url(#plata-grad)" stroke="#7D8894" strokeWidth="1.2" strokeLinejoin="round" /><line x1="9" y1="6.5" x2="31" y2="6.5" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" opacity=".9" /></svg><svg className="lingote" viewBox="0 0 40 24" aria-hidden="true"><defs><clipPath id="ocho-decimas"><rect x="0" y="0" width="32" height="24" /></clipPath></defs><polygon points="7,3 33,3 39,21 1,21" fill="none" stroke="rgba(237,239,241,.45)" strokeWidth="1.2" strokeLinejoin="round" /><g clipPath="url(#ocho-decimas)"><polygon points="7,3 33,3 39,21 1,21" fill="url(#plata-grad)" stroke="#7D8894" strokeWidth="1.2" strokeLinejoin="round" /></g></svg></div>
                <span className="valor">4,8</span>
                <small>Ejemplo de evaluación</small>
              </div>
            </div>
            <div className="como-funciona">
              <h3>Cómo funciona para ti</h3>
              <ol className="pasos">
                <li><h4>Crea tu perfil</h4><p>Cuéntanos tu trayectoria, tu área de experiencia y cuántas horas quieres trabajar.</p></li>
                <li><h4>Validamos tu experiencia</h4><p>Revisamos tu perfil para presentarte ante las pymes con respaldo.</p></li>
                <li><h4>Recibe propuestas y agenda</h4><p>Te conectamos con pymes que necesitan lo que sabes hacer, y coordinas las sesiones en la agenda de la plataforma.</p></li>
              </ol>
            </div>
          </div>
        </section>

        <section className="preguntas" id="preguntas" aria-labelledby="preguntas-titulo">
          <div className="contenedor">
            <h2 id="preguntas-titulo">Preguntas frecuentes</h2>
            <div className="lista-preguntas">
              <details><summary>¿Quién responde por el trabajo del ejecutivo?</summary><p>El alcance y los entregables se acuerdan directamente entre la pyme y el ejecutivo, y son responsabilidad de ambos. Silver Job los conecta, coordina la agenda y administra los pagos.</p></details>
              <details><summary>¿Qué pasa si no uso todas mis horas?</summary><p>Las horas de cada plan se usan dentro del mes contratado. Puedes reagendar una sesión al mes avisando con 24 horas de anticipación. Si es el ejecutivo quien cancela, esa hora queda como crédito para el mes siguiente.</p></details>
              <details><summary>¿Cómo validan a los ejecutivos?</summary><p>Revisamos la trayectoria de cada ejecutivo antes de presentarlo. Después, las pymes evalúan su trabajo con lingotes de uno a cinco, y los mejor evaluados obtienen el sello Plata certificada.</p></details>
              <details><summary>¿Cómo se paga?</summary><p>La pyme paga una mensualidad a Silver Job que ya incluye las horas del ejecutivo. Silver Job le paga al ejecutivo a fin de mes por las horas trabajadas. Al concretarse un match se cobra un fee único a cada parte.</p></details>
              <details><summary>¿Cuánto cuesta sumarme como ejecutivo?</summary><p>Crear tu perfil es gratis. Solo pagas un fee único cuando se concreta un match con una pyme.</p></details>
              <details><summary>¿Es confidencial lo que comparto?</summary><p>La agenda de Silver Job registra solo fechas y horarios, no el contenido de las sesiones. La información que la pyme comparte con el ejecutivo queda entre ellos.</p></details>
            </div>
          </div>
        </section>

        <section className="formulario-seccion" id="lista" aria-labelledby="lista-titulo">
          <div className="contenedor">
            <div className="intro">
              <h2 id="lista-titulo">Súmate a la lista</h2>
              <p>Estamos armando el primer grupo de pymes y ejecutivos. Déjanos tus datos y te avisamos cuando abramos.</p>
            </div>

            <FormularioLista />
          </div>
        </section>
      </main>

      <footer className="pie">
        <div className="contenedor">
          <div className="pie-marca">
            <a className="marca" href="/" aria-label="silverjob, ir al inicio"><Anillo /><span className="palabra">silverjob</span></a>
            <p>Silver Job nace en Santiago para conectar la experiencia de ejecutivos senior con pymes que quieren crecer.</p>
          </div>
          <div className="pie-enlaces">
            <a href="mailto:tomas@silverjob.cl">tomas@silverjob.cl</a>
            <a href="/privacidad">Política de privacidad</a>
            <span>© 2026 Silver Job, Santiago, Chile</span>
          </div>
        </div>
      </footer>    </>
  );
}
