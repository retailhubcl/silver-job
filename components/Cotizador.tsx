"use client";

import { useState } from "react";
import {
  DESCUENTO_ANUAL, GERENCIAS, HORAS_MAX, TRAMOS,
  cotizarBloques, cotizarPlan, esHorasValidas, formatoCLP, type Gerencia, type Modalidad,
} from "@/lib/precios";

function Gerencias({ valor, onChange }: { valor: Gerencia; onChange: (g: Gerencia) => void }) {
  return (
    <fieldset className="pago-opciones">
      <legend>Gerencia</legend>
      {(Object.keys(GERENCIAS) as Gerencia[]).map((g) => (
        <label key={g}>
          <input type="radio" name="gerencia" value={g} checked={valor === g} onChange={() => onChange(g)} required />
          {GERENCIAS[g]}
        </label>
      ))}
    </fieldset>
  );
}

function Resumen({ lineas, total, nota }: { lineas: { concepto: string; monto: number }[]; total: number; nota?: string }) {
  return (
    <div className="pago-resumen" aria-live="polite">
      <ul>
        {lineas.map((l) => (
          <li key={l.concepto}><span>{l.concepto}</span><strong>{formatoCLP(l.monto)}</strong></li>
        ))}
      </ul>
      <p className="pago-total"><span>Total a pagar, IVA incluido</span><strong>{formatoCLP(total)}</strong></p>
      {nota && <p className="pago-nota">{nota}</p>}
    </div>
  );
}

function DatosComprador() {
  return (
    <div className="pago-campos">
      <label>Nombre<input name="nombre" autoComplete="name" required maxLength={200} /></label>
      <label>Empresa<input name="empresa" autoComplete="organization" required maxLength={200} /></label>
      <label>Correo<input name="correo" type="email" autoComplete="email" required maxLength={200} /></label>
    </div>
  );
}

export function CotizadorPlan({ horasIniciales }: { horasIniciales: number }) {
  const [gerencia, setGerencia] = useState<Gerencia>("otras");
  const [horasTexto, setHorasTexto] = useState(String(horasIniciales));
  const [modalidad, setModalidad] = useState<Modalidad>("mensual");
  const horas = Number(horasTexto);
  const valida = esHorasValidas(horas);
  const cotizacion = valida ? cotizarPlan({ gerencia, horas, modalidad }) : null;

  return (
    <form method="post" action="/api/checkout">
      <input type="hidden" name="tipo" value="plan" />
      <Gerencias valor={gerencia} onChange={setGerencia} />
      <div className="pago-campos">
        <label>
          Horas al mes
          <input name="horas" type="number" inputMode="numeric" min={1} max={HORAS_MAX} step={1} required value={horasTexto} onChange={(e) => setHorasTexto(e.target.value)} />
        </label>
      </div>
      {cotizacion && (
        <p className="pago-nota">
          Plan {cotizacion.tramo.nombre} ({cotizacion.tramo.desde} a {cotizacion.tramo.hasta} h): {formatoCLP(cotizacion.tramo.precioHora[gerencia])} la hora.
        </p>
      )}
      <fieldset className="pago-opciones">
        <legend>Modalidad</legend>
        <label><input type="radio" name="modalidad" value="mensual" checked={modalidad === "mensual"} onChange={() => setModalidad("mensual")} /> Mensual</label>
        <label><input type="radio" name="modalidad" value="anual" checked={modalidad === "anual"} onChange={() => setModalidad("anual")} /> Anual, 12 meses pagados por adelantado con {DESCUENTO_ANUAL * 100}% de descuento</label>
      </fieldset>
      {cotizacion ? (
        <Resumen
          lineas={cotizacion.lineas}
          total={cotizacion.total}
          nota={cotizacion.pisoAplicado ? `Con ${horas} h se cobra el mínimo del plan Intensivo, igual al tope del plan Estándar.` : undefined}
        />
      ) : (
        <p className="form-error" role="alert">Elige entre 1 y {HORAS_MAX} horas al mes, en horas enteras.</p>
      )}
      <DatosComprador />
      <button className="boton" type="submit" disabled={!cotizacion}>Pagar con Mercado Pago</button>
    </form>
  );
}

export function CotizadorBloques() {
  const [gerencia, setGerencia] = useState<Gerencia>("otras");
  const [tramoId, setTramoId] = useState(TRAMOS[1].id);
  const [cantidad, setCantidad] = useState(1);
  const tramo = TRAMOS.find((t) => t.id === tramoId)!;
  const cotizacion = cotizarBloques({ gerencia, tramo, cantidad });

  return (
    <form method="post" action="/api/checkout">
      <input type="hidden" name="tipo" value="bloque" />
      <Gerencias valor={gerencia} onChange={setGerencia} />
      <div className="pago-campos">
        <label>
          Tu plan de este mes
          <select name="tramo" value={tramoId} onChange={(e) => setTramoId(e.target.value as typeof tramoId)}>
            {TRAMOS.map((t) => <option key={t.id} value={t.id}>{t.nombre} ({t.desde} a {t.hasta} h)</option>)}
          </select>
        </label>
        <label>
          Bloques de 5 horas
          <select name="cantidad" value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))}>
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} ({n * 5} h)</option>)}
          </select>
        </label>
      </div>
      <Resumen lineas={cotizacion.lineas} total={cotizacion.total} nota="Las horas adicionales cuestan 10% más que la hora de tu plan y se usan dentro del mismo mes. Si necesitas más horas todos los meses, te conviene subir de plan." />
      <DatosComprador />
      <button className="boton" type="submit">Pagar con Mercado Pago</button>
    </form>
  );
}
