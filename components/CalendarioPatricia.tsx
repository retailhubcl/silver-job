"use client";

import { useEffect, useRef, useState } from "react";

// V = viña, P = panadería, T = transportes, _ = libre
const SEMANAS = ["VPT_V", "PV_TP", "VPTV_", "P_VT_"];
const CLASES: Record<string, string> = { V: "vina", P: "pan", T: "trans", _: "libre" };
const DIAS = ["Lu", "Ma", "Mi", "Ju", "Vi"];

export default function CalendarioPatricia() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // La grilla se llena cuando entra en pantalla
  useEffect(() => {
    const grilla = ref.current;
    if (!grilla || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    obs.observe(grilla);
    return () => obs.disconnect();
  }, []);

  let i = 0;
  return (
    <div
      className="grilla"
      id="grilla"
      ref={ref}
      role="img"
      aria-label="Calendario de cuatro semanas: 6 mañanas para una viña, 5 para una panadería, 4 para una empresa de transportes y 5 libres."
    >
      <span />
      {DIAS.map((d) => (
        <span key={d} className="dia">{d}</span>
      ))}
      {SEMANAS.map((fila, s) => [
        <span key={`s${s}`} className="semana">Sem {s + 1}</span>,
        ...[...fila].map((c, k) => {
          const retraso = 150 + i++ * 55;
          return (
            <span
              key={`${s}-${k}`}
              className={`celda ${CLASES[c]}${visible ? " entra" : ""}`}
              style={{ animationDelay: `${retraso}ms`, opacity: visible ? undefined : 0 }}
            />
          );
        }),
      ])}
    </div>
  );
}
