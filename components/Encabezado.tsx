"use client";

import { useEffect, useRef, useState } from "react";
import Anillo from "@/components/Anillo";

const ENLACES = [
  { href: "#pymes", largo: "Para pymes", corto: "Pymes" },
  { href: "#ejecutivos", largo: "Para ejecutivos", corto: "Ejecutivos" },
  { href: "#planes", largo: "Planes", corto: "Planes" },
  { href: "#preguntas", largo: "Preguntas", corto: "Preguntas" },
];

// En móvil el encabezado se oculta al bajar y vuelve al subir (ver .encabezado.oculto en globals.css)
export default function Encabezado() {
  const ref = useRef<HTMLElement>(null);
  const [oculto, setOculto] = useState(false);

  useEffect(() => {
    let ultimo = window.scrollY;
    let pendiente = false;
    const revisar = () => {
      pendiente = false;
      const y = window.scrollY;
      const conFoco = ref.current?.contains(document.activeElement);
      if (y < 120 || conFoco) setOculto(false);
      else if (y > ultimo + 6) setOculto(true);
      else if (y < ultimo - 6) setOculto(false);
      ultimo = y;
    };
    const alDesplazar = () => {
      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(revisar);
      }
    };
    window.addEventListener("scroll", alDesplazar, { passive: true });
    return () => window.removeEventListener("scroll", alDesplazar);
  }, []);

  return (
    <header ref={ref} className={`encabezado${oculto ? " oculto" : ""}`} onFocus={() => setOculto(false)}>
      <div className="contenedor">
        <a className="marca" href="/" aria-label="silverjob, ir al inicio"><Anillo /><span className="palabra">silverjob</span></a>
        <nav className="nav" aria-label="Principal">
          {ENLACES.map((e) => (
            <a key={e.href} href={e.href}>
              <span className="texto-largo">{e.largo}</span>
              <span className="texto-corto">{e.corto}</span>
            </a>
          ))}
        </nav>
        <a className="boton plata boton-encabezado" href="#lista">Súmate a la lista</a>
      </div>
    </header>
  );
}
