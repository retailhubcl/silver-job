"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { EVENTO_AREA, EVENTO_PLAN, EVENTO_TIPO, type TipoRegistro } from "@/lib/eventos";
import { ORDEN, normalizarLinkedin, validarRegistro, type Errores } from "@/lib/validacion";

// Planilla de Google (Apps Script); debe responder {"result":"success"}
const ENDPOINT =
  process.env.NEXT_PUBLIC_LISTA_ENDPOINT ??
  "https://script.google.com/macros/s/AKfycbw9Np-Q-NXn1vAJLqxbbgqyIYjTI8gS5pbItaat_oL4s_3Z1MMuSQgNzQtKq3HFOg_E/exec";

const AREAS = ["Gerencia general", "Operaciones", "Marketing", "Finanzas", "Comercial", "Otra"];

export default function FormularioLista() {
  const [tipo, setTipo] = useState<TipoRegistro>("pyme");
  const [horas, setHoras] = useState("");
  const [areaPyme, setAreaPyme] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(false);
  const [correoRegistrado, setCorreoRegistrado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [errores, setErrores] = useState<Errores>({});
  const linkedin = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const alTipo = (e: Event) => elegirTipo((e as CustomEvent<TipoRegistro>).detail);
    const alPlan = (e: Event) => setHoras((e as CustomEvent<string>).detail);
    window.addEventListener(EVENTO_TIPO, alTipo);
    const alArea = (e: Event) => setAreaPyme((e as CustomEvent<string>).detail);
    window.addEventListener(EVENTO_PLAN, alPlan);
    window.addEventListener(EVENTO_AREA, alArea);
    return () => {
      window.removeEventListener(EVENTO_AREA, alArea);
      window.removeEventListener(EVENTO_TIPO, alTipo);
      window.removeEventListener(EVENTO_PLAN, alPlan);
    };
  }, []);

  function elegirTipo(nuevo: TipoRegistro) {
    setTipo(nuevo);
    setErrores({});
  }

  // Al corregir un campo se quita su mensaje de error
  function alCambiar(e: React.FormEvent<HTMLFormElement>) {
    const nombre = (e.target as HTMLInputElement).name;
    if (errores[nombre]) setErrores(({ [nombre]: _, ...resto }) => resto);
  }

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (linkedin.current && !linkedin.current.disabled) linkedin.current.value = normalizarLinkedin(linkedin.current.value);
    const datos = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const encontrados = validarRegistro(datos, tipo);
    setErrores(encontrados);
    const primero = ORDEN[tipo].find((k) => encontrados[k]);
    if (primero) {
      form.querySelector<HTMLElement>(`[name="${primero}"]:not(:disabled)`)?.focus();
      return;
    }
    setEnviando(true);
    setError(false);
    try {
      const respuesta = await fetch(ENDPOINT, { method: "POST", body: new URLSearchParams(datos) });
      const resultado = await respuesta.json();
      if (resultado.result !== "success") throw new Error("La planilla no confirmó el registro");
      track("registro", { tipo: datos.tipo });
      setCorreoRegistrado(datos.correo);
    } catch {
      setEnviando(false);
      setError(true);
    }
  }

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText("https://silverjob.cl");
      setCopiado("Enlace copiado");
    } catch {
      setCopiado("silverjob.cl");
    }
  }

  const esPyme = tipo === "pyme";
  const cantidadErrores = Object.keys(errores).length;
  // Atributos y mensaje de error de cada campo (id = id del control)
  const marca = (campo: string, id: string) =>
    errores[campo] ? { "aria-invalid": true as const, "aria-describedby": `${id}-error` } : {};
  const mensaje = (campo: string, id: string) =>
    errores[campo] ? <p className="campo-error" id={`${id}-error`}>{errores[campo]}</p> : null;
  return (
    <div className="tarjeta-form">
      <div className="selector" role="tablist" aria-label="Tipo de registro" hidden={!!correoRegistrado}>
        <button type="button" role="tab" id="tab-pyme" aria-selected={esPyme} aria-controls="form-lista" onClick={() => elegirTipo("pyme")}>Soy pyme</button>
        <button type="button" role="tab" id="tab-ejecutivo" aria-selected={!esPyme} aria-controls="form-lista" onClick={() => elegirTipo("ejecutivo")}>Soy ejecutivo</button>
      </div>

      <form id="form-lista" noValidate onSubmit={enviar} onInput={alCambiar} onChange={alCambiar} hidden={!!correoRegistrado}>
        <input type="hidden" name="tipo" value={tipo} />
        <div className="trampa" aria-hidden="true"><label>Sitio web <input name="sitio" tabIndex={-1} autoComplete="off" /></label></div>
        <div className="campos">
          <div className="campo"><label htmlFor="nombre">Nombre</label><input id="nombre" name="nombre" autoComplete="name" required {...marca("nombre", "nombre")} />{mensaje("nombre", "nombre")}</div>
          <div className="campo"><label htmlFor="correo">Correo</label><input id="correo" name="correo" type="email" autoComplete="email" required {...marca("correo", "correo")} />{mensaje("correo", "correo")}</div>

          <div className="campo solo-pyme" hidden={!esPyme}><label htmlFor="empresa">Empresa</label><input id="empresa" name="empresa" autoComplete="organization" disabled={!esPyme} required {...marca("empresa", "empresa")} />{mensaje("empresa", "empresa")}</div>
          <div className="campo solo-pyme" hidden={!esPyme}><label htmlFor="area-pyme">¿Qué gerencia necesitas?</label>
            <select id="area-pyme" name="area" disabled={!esPyme} required value={areaPyme} onChange={(e) => setAreaPyme(e.target.value)} {...(esPyme ? marca("area", "area-pyme") : {})}>
              <option value="">Elige una</option>
              {AREAS.map((a) => <option key={a}>{a}</option>)}
            </select>
            {esPyme && mensaje("area", "area-pyme")}
          </div>
          <div className="campo ancho solo-pyme" hidden={!esPyme}><label htmlFor="horas">Horas al mes, aproximado</label>
            <select id="horas" name="horas" disabled={!esPyme} required value={horas} onChange={(e) => setHoras(e.target.value)} {...marca("horas", "horas")}>
              <option value="">Elige un rango</option>
              <option>Hasta 10 (Básico)</option><option>Entre 11 y 26 (Estándar)</option><option>Entre 27 y 40 (Intensivo)</option><option>Aún no lo sé</option>
            </select>
            {mensaje("horas", "horas")}
          </div>

          <div className="campo ancho solo-ejecutivo" hidden={esPyme}><label htmlFor="linkedin">Perfil de LinkedIn</label><input ref={linkedin} id="linkedin" name="linkedin" type="text" inputMode="url" autoComplete="url" placeholder="linkedin.com/in/tu-nombre" disabled={esPyme} required {...marca("linkedin", "linkedin")} />{mensaje("linkedin", "linkedin")}</div>
          <div className="campo solo-ejecutivo" hidden={esPyme}><label htmlFor="area-ejec">Tu área de experiencia</label>
            <select id="area-ejec" name="area" disabled={esPyme} required defaultValue="" {...(!esPyme ? marca("area", "area-ejec") : {})}>
              <option value="">Elige una</option>
              {AREAS.map((a) => <option key={a}>{a}</option>)}
            </select>
            {!esPyme && mensaje("area", "area-ejec")}
          </div>
          <div className="campo solo-ejecutivo" hidden={esPyme}><label htmlFor="anios">Años de experiencia</label>
            <select id="anios" name="anios" disabled={esPyme} required defaultValue="" {...marca("anios", "anios")}>
              <option value="">Elige un rango</option>
              <option>Entre 10 y 20</option><option>Entre 20 y 30</option><option>Más de 30</option>
            </select>
            {mensaje("anios", "anios")}
          </div>
        </div>
        <label className="consentimiento"><input type="checkbox" id="consentimiento" name="consentimiento" value="si" required {...marca("consentimiento", "consentimiento")} /> <span>Acepto que Silver Job use mis datos para contactarme, según la <a href="/privacidad" target="_blank" rel="noopener">política de privacidad</a>.</span></label>
        {mensaje("consentimiento", "consentimiento")}
        <p className="form-error" role="alert" hidden={cantidadErrores === 0}>
          {cantidadErrores === 1 ? "Revisa el campo marcado." : `Revisa los ${cantidadErrores} campos marcados.`}
        </p>
        <p className="form-error" id="form-error" role="alert" hidden={!error}>
          No pudimos guardar tu registro. Inténtalo de nuevo o escríbenos a tomas@silverjob.cl.
        </p>
        <div className="form-pie">
          <button className="boton" type="submit" disabled={enviando}>{enviando ? "Enviando..." : "Súmate a la lista"}</button>
        </div>
      </form>

      <div className="confirmacion" id="confirmacion" role="status" aria-live="polite" style={correoRegistrado ? { display: "block" } : undefined}>
        <h3>Ya estás en la lista</h3>
        <p id="confirmacion-texto">Te escribiremos a {correoRegistrado} para conocer tu caso, y te avisaremos antes que a nadie cuando abramos.</p>
        <div className="compartir">
          <p>¿Conoces a una pyme o a un ejecutivo al que le serviría Silver Job?</p>
          <div className="acciones">
            <a className="boton" href="https://wa.me/?text=Mira%20Silver%20Job%3A%20gerentes%20senior%20por%20horas%20para%20pymes.%20https%3A%2F%2Fsilverjob.cl" target="_blank" rel="noopener" id="compartir-wa">Compartir por WhatsApp</a>
            <button className="boton secundario" type="button" id="copiar-enlace" onClick={copiarEnlace}>{copiado ?? "Copiar enlace"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
