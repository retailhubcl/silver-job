import type { Metadata } from "next";
import { cookies } from "next/headers";
import { almacenHabilitado, listar } from "@/lib/redes/almacen";
import { aSantiago, formatear } from "@/lib/redes/fechas";
import { generacionConClaude } from "@/lib/redes/generar";
import { redConectada, urlImagen } from "@/lib/redes/publicar";
import { COOKIE, sesionValida } from "@/lib/redes/sesion";
import { LIMITE_TEXTO, NOMBRE_RED, REDES, type Publicacion } from "@/lib/redes/tipos";
import { entrar, generarAccion, gestionar, salir } from "./acciones";
import estilos from "./redes.module.css";

export const metadata: Metadata = { title: "Redes | Silver Job", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const ETIQUETA = { borrador: "Borrador", programado: "Programada", publicando: "Publicando", publicado: "Publicada", error: "Con error" } as const;

export default async function Redes({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  const { aviso } = await searchParams;
  const clave = process.env.ADMIN_REDES_CLAVE;
  const dentro = sesionValida((await cookies()).get(COOKIE)?.value, clave);

  if (!dentro) {
    return (
      <main className={estilos.pagina}>
        <h1>Redes de Silver Job</h1>
        {!clave ? (
          <p>Falta definir ADMIN_REDES_CLAVE en las variables de entorno.</p>
        ) : (
          <form action={entrar} className={estilos.login}>
            <label>
              Clave
              <input type="password" name="clave" required autoComplete="current-password" />
            </label>
            <button type="submit">Entrar</button>
            {aviso ? <p role="alert">{aviso}</p> : null}
          </form>
        )}
      </main>
    );
  }

  const listo = almacenHabilitado();
  const publicaciones: Publicacion[] = listo ? await listar().catch(() => []) : [];

  return (
    <main className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <h1>Redes de Silver Job</h1>
        <form action={salir}>
          <button type="submit" className={estilos.secundario}>Salir</button>
        </form>
      </header>

      {aviso ? <p role="status" className={estilos.aviso}>{aviso}</p> : null}

      <ul className={estilos.estado} aria-label="Conexiones">
        <li data-ok={listo}>Base de datos: {listo ? "conectada" : "falta SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY"}</li>
        <li data-ok={generacionConClaude()}>Redacción: {generacionConClaude() ? "Claude" : "plantilla simple (falta ANTHROPIC_API_KEY)"}</li>
        {REDES.map((r) => (
          <li key={r} data-ok={redConectada(r)}>
            {NOMBRE_RED[r]}: {redConectada(r) ? "conectada" : "faltan credenciales"}
          </li>
        ))}
      </ul>

      <section aria-labelledby="gen">
        <h2 id="gen">Generar publicación</h2>
        <form action={generarAccion} className={estilos.generar}>
          <label>
            Tema (vacío = el siguiente de la rotación)
            <input name="tema" maxLength={300} placeholder="Ej.: Cómo una pyme ahorra con un gerente de finanzas por horas" />
          </label>
          <label>
            Red
            <select name="red" defaultValue="ambas">
              <option value="ambas">LinkedIn e Instagram</option>
              <option value="linkedin">Solo LinkedIn</option>
              <option value="instagram">Solo Instagram</option>
            </select>
          </label>
          <button type="submit" disabled={!listo}>Generar</button>
        </form>
      </section>

      <section aria-labelledby="cola">
        <h2 id="cola">Publicaciones</h2>
        {publicaciones.length === 0 ? <p>Todavía no hay publicaciones.</p> : null}
        {publicaciones.map((p) => {
          const cerrada = p.estado === "publicado" || p.estado === "publicando";
          return (
            <article key={p.id} className={estilos.tarjeta} data-estado={p.estado}>
              <div className={estilos.meta}>
                <strong>{NOMBRE_RED[p.red]}</strong>
                <span className={estilos.etiqueta}>{ETIQUETA[p.estado]}</span>
                {p.estado === "programado" ? <span>{formatear(p.programada_para)}</span> : null}
                {p.estado === "publicado" ? <span>{formatear(p.publicada_en)}</span> : null}
                <span className={estilos.tema}>{p.tema}</span>
              </div>
              {p.error ? <p role="alert" className={estilos.error}>{p.error}</p> : null}
              <div className={estilos.cuerpo}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={urlImagen(p.id, "png").replace(/^https?:\/\/[^/]+/, "")} alt={p.titular} width={160} height={p.red === "instagram" ? 200 : 160} />
                <form action={gestionar}>
                  <input type="hidden" name="id" value={p.id} />
                  <label>
                    Texto ({p.texto.length}/{LIMITE_TEXTO[p.red]})
                    <textarea name="texto" defaultValue={p.texto} rows={8} maxLength={LIMITE_TEXTO[p.red]} readOnly={cerrada} required />
                  </label>
                  <div className={estilos.fila}>
                    <label>
                      Titular de la imagen
                      <input name="titular" defaultValue={p.titular} maxLength={70} readOnly={cerrada} />
                    </label>
                    <label>
                      Bajada
                      <input name="bajada" defaultValue={p.bajada} maxLength={120} readOnly={cerrada} />
                    </label>
                  </div>
                  {cerrada ? null : (
                    <div className={estilos.acciones}>
                      <label>
                        Fecha (hora de Chile; vacío = próximo hueco)
                        <input type="datetime-local" name="cuando" defaultValue={p.programada_para ? aSantiago(new Date(p.programada_para)) : ""} />
                      </label>
                      <button name="accion" value="programar">Programar</button>
                      <button name="accion" value="guardar" className={estilos.secundario}>Guardar borrador</button>
                      <button name="accion" value="ahora" className={estilos.secundario}>Publicar ahora</button>
                      <button name="accion" value="descartar" className={estilos.peligro} formNoValidate>Descartar</button>
                    </div>
                  )}
                </form>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
