"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import EnlaceRegistro from "@/components/EnlaceRegistro";
import { sugerirArea, sugerirHoras } from "@/lib/eventos";
import { DESCUENTO_ANUAL, HORAS_MAX, formatoCLP, mensualidad, montoAnual, type Gerencia, type Modalidad } from "@/lib/precios";

// Áreas del formulario de la lista de espera, con su precio
const AREAS: { nombre: string; gerencia: Gerencia }[] = [
  { nombre: "Operaciones", gerencia: "otras" },
  { nombre: "Finanzas", gerencia: "otras" },
  { nombre: "Comercial", gerencia: "otras" },
  { nombre: "Marketing", gerencia: "otras" },
  { nombre: "Gerencia general", gerencia: "general" },
];

// Opción del campo "Horas al mes" del formulario según el tramo
const OPCION_TRAMO = { basico: "Hasta 10 (Básico)", estandar: "Entre 11 y 26 (Estándar)", intensivo: "Entre 27 y 40 (Intensivo)" };

export default function SimuladorPlan({ pagosAbiertos }: { pagosAbiertos: boolean }) {
  const [area, setArea] = useState(AREAS[0]);
  const [horas, setHoras] = useState(18);
  const [modalidad, setModalidad] = useState<Modalidad>("mensual");
  const { tramo, monto, pisoAplicado } = mensualidad(area.gerencia, horas);
  const anual = montoAnual(monto);
  const semana = Math.max(0.5, Math.round((horas * 12) / 52 * 2) / 2);
  const cambiarHoras = (h: number) => setHoras(Math.min(HORAS_MAX, Math.max(1, h)));

  return (
    <div className="simulador" aria-labelledby="simulador-titulo">
      <h3 id="simulador-titulo">Simula tu plan</h3>
      <div className="simulador-controles">
        <div className="sim-campo">
          <label htmlFor="sim-area">Gerencia</label>
          <select id="sim-area" value={area.nombre} onChange={(e) => setArea(AREAS.find((a) => a.nombre === e.target.value)!)}>
            {AREAS.map((a) => <option key={a.nombre}>{a.nombre}</option>)}
          </select>
        </div>
        <div className="sim-campo">
          <label htmlFor="sim-horas">Horas al mes</label>
          <div className="sim-horas">
            <button type="button" onClick={() => cambiarHoras(horas - 1)} disabled={horas <= 1} aria-label="Una hora menos">−</button>
            <input
              id="sim-horas"
              type="range"
              min={1}
              max={HORAS_MAX}
              step={1}
              value={horas}
              onChange={(e) => cambiarHoras(Number(e.target.value))}
              aria-valuetext={`${horas} horas al mes, plan ${tramo.nombre}`}
            />
            <button type="button" onClick={() => cambiarHoras(horas + 1)} disabled={horas >= HORAS_MAX} aria-label="Una hora más">+</button>
            <output htmlFor="sim-horas">{horas} h</output>
          </div>
          <p className="sim-ayuda">Cerca de {semana.toLocaleString("es-CL")} {semana === 1 ? "hora" : "horas"} a la semana</p>
        </div>
        <fieldset className="sim-campo">
          <legend>Forma de pago</legend>
          <label><input type="radio" name="sim-modalidad" checked={modalidad === "mensual"} onChange={() => setModalidad("mensual")} /> Mensual</label>
          <label><input type="radio" name="sim-modalidad" checked={modalidad === "anual"} onChange={() => setModalidad("anual")} /> Anual, {DESCUENTO_ANUAL * 100}% de descuento</label>
        </fieldset>
      </div>

      <div className="simulador-resultado">
        <div aria-live="polite">
          <p className="sim-plan">Plan {tramo.nombre} · {formatoCLP(tramo.precioHora[area.gerencia])} la hora</p>
          {modalidad === "mensual" ? (
            <p className="sim-total"><strong>{formatoCLP(monto)}</strong> al mes</p>
          ) : (
            <p className="sim-total"><strong>{formatoCLP(anual)}</strong> al año<small>Equivale a {formatoCLP(Math.round(anual / 12))} al mes; ahorras {formatoCLP(monto * 12 - anual)}</small></p>
          )}
          <p className="sim-nota">
            IVA incluido. Es todo lo que pagas.{pisoAplicado && ` Con ${horas} horas se cobra el mínimo del plan ${tramo.nombre}.`}
          </p>
        </div>
        {pagosAbiertos ? (
          <a
            className="boton"
            href={`/pagar?horas=${horas}&gerencia=${area.gerencia}&modalidad=${modalidad}`}
            onClick={() => track("clic_contratar", { horas, gerencia: area.gerencia, modalidad })}
          >
            Contratar este plan
          </a>
        ) : (
          <div className="sim-accion">
            <EnlaceRegistro
              className="boton"
              tipo="pyme"
              onClick={() => {
                sugerirHoras(OPCION_TRAMO[tramo.id]);
                sugerirArea(area.nombre);
              }}
            >
              Súmate con este plan
            </EnlaceRegistro>
            <p className="sim-nota">Aún no abrimos los pagos. Te inscribes en la lista de espera con este plan y te avisamos primero.</p>
          </div>
        )}
      </div>
    </div>
  );
}
