"use client";

import { useEffect, useState } from "react";
import EnlaceRegistro from "@/components/EnlaceRegistro";
import { sugerirHoras } from "@/lib/eventos";

const PLANES = [
  { nombre: "Básico", texto: "hasta 10 horas al mes", opcion: "Hasta 10 (Básico)" },
  { nombre: "Estándar", texto: "de 11 a 26 horas al mes", opcion: "Entre 11 y 26 (Estándar)" },
  { nombre: "Intensivo", texto: "de 27 a 40 horas al mes", opcion: "Entre 27 y 40 (Intensivo)" },
];

export default function GuiaPlan() {
  const [g1, setG1] = useState<number | null>(null);
  const [g2, setG2] = useState<number | null>(null);
  const indice = g1 && g2 ? (g1 + g2 <= 3 ? 0 : g1 + g2 === 4 ? 1 : 2) : null;
  const plan = indice === null ? null : PLANES[indice];

  // Marca el tramo sugerido en la regla de planes
  useEffect(() => {
    document.querySelectorAll(".tramo").forEach((li, k) => li.classList.toggle("sugerido", k === indice));
  }, [indice]);

  return (
    <div className="guia" aria-labelledby="guia-titulo">
      <h3 id="guia-titulo">¿Qué plan necesitas?</h3>
      <fieldset>
        <legend>¿Qué quieres resolver?</legend>
        {["Un tema puntual", "Liderar un área de forma continua", "Una etapa de cambio fuerte"].map((t, k) => (
          <label key={t}><input type="radio" name="g1" value={k + 1} onChange={() => setG1(k + 1)} /> {t}</label>
        ))}
      </fieldset>
      <fieldset>
        <legend>¿Con qué frecuencia necesitas al gerente?</legend>
        {["Un par de veces al mes", "Una vez por semana", "Varias veces por semana"].map((t, k) => (
          <label key={t}><input type="radio" name="g2" value={k + 1} onChange={() => setG2(k + 1)} /> {t}</label>
        ))}
      </fieldset>
      <div className="guia-pie">
        <p className="guia-resultado" id="guia-resultado" aria-live="polite">
          {plan ? (
            <>Te sugerimos el plan <strong>{plan.nombre}</strong>, {plan.texto}.</>
          ) : (
            "Responde las dos preguntas y te sugerimos un plan."
          )}
        </p>
        {plan && (
          <EnlaceRegistro className="boton" tipo="pyme" onClick={() => sugerirHoras(plan.opcion)}>
            Súmate con este plan
          </EnlaceRegistro>
        )}
      </div>
    </div>
  );
}
