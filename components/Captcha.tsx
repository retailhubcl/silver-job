"use client";

import { useEffect, useRef } from "react";

// Cloudflare Turnstile. Si NEXT_PUBLIC_TURNSTILE_SITE_KEY no está definida no muestra nada.
// El widget agrega solo el campo oculto "cf-turnstile-response" al formulario que lo contiene.
const CLAVE = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type Turnstile = { render: (el: HTMLElement, opciones: Record<string, unknown>) => string; remove: (id: string) => void };
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

let cargando: Promise<void> | null = null;
function cargarScript() {
  if (window.turnstile) return Promise.resolve();
  cargando ??= new Promise<void>((ok, fallo) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => ok();
    s.onerror = () => {
      cargando = null;
      fallo(new Error("No cargó Turnstile"));
    };
    document.head.appendChild(s);
  });
  return cargando;
}

export default function Captcha() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!CLAVE || !ref.current) return;
    let id: string | undefined;
    let activo = true;
    cargarScript()
      .then(() => {
        if (activo && ref.current && window.turnstile) {
          id = window.turnstile.render(ref.current, { sitekey: CLAVE, language: "es", theme: "light" });
        }
      })
      .catch(() => {});
    return () => {
      activo = false;
      if (id) window.turnstile?.remove(id);
    };
  }, []);
  if (!CLAVE) return null;
  return <div ref={ref} className="captcha" />;
}
