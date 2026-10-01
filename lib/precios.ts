// Precios de Silver Job (ver "Precios" en CLAUDE.md). Todos los montos en CLP, IVA incluido.
// Precio hora = redondeo a $500 de (valor hora del ejecutivo / (1 − margen) × 1,19).

export type Gerencia = "general" | "otras";
export type IdTramo = "basico" | "estandar" | "intensivo";
export type Modalidad = "mensual" | "anual";

export const GERENCIAS: Record<Gerencia, string> = {
  general: "Gerente General",
  otras: "Otras gerencias (Operaciones, Marketing, Finanzas, Comercial)",
};

export interface Tramo {
  id: IdTramo;
  nombre: string;
  desde: number;
  hasta: number;
  precioHora: Record<Gerencia, number>;
}

export const TRAMOS: Tramo[] = [
  { id: "basico", nombre: "Básico", desde: 1, hasta: 10, precioHora: { general: 127_500, otras: 102_000 } },
  { id: "estandar", nombre: "Estándar", desde: 11, hasta: 26, precioHora: { general: 119_000, otras: 95_000 } },
  { id: "intensivo", nombre: "Intensivo", desde: 27, hasta: 40, precioHora: { general: 111_500, otras: 89_500 } },
];

export const HORAS_MAX = 40;
export const HORAS_BLOQUE = 5;
export const RECARGO_BLOQUE = 0.1;
export const DESCUENTO_ANUAL = 0.1;
export const FEE_MATCH_PYME = 150_000;
export const FEE_MATCH_EJECUTIVO = 50_000;

export const redondeo500 = (n: number) => Math.round(n / 500) * 500;

export function esHorasValidas(horas: number) {
  return Number.isInteger(horas) && horas >= 1 && horas <= HORAS_MAX;
}

export function tramoDe(horas: number): Tramo {
  const tramo = TRAMOS.find((t) => horas >= t.desde && horas <= t.hasta);
  if (!tramo) throw new RangeError(`Horas fuera de rango: ${horas}`);
  return tramo;
}

// La mensualidad nunca baja del tope del tramo anterior (solo ocurre en 27 h)
export function mensualidad(gerencia: Gerencia, horas: number) {
  const tramo = tramoDe(horas);
  const calculado = horas * tramo.precioHora[gerencia];
  const anterior = TRAMOS[TRAMOS.indexOf(tramo) - 1];
  const piso = anterior ? anterior.hasta * anterior.precioHora[gerencia] : 0;
  return { tramo, monto: Math.max(calculado, piso), pisoAplicado: piso > calculado };
}

export function precioBloque(gerencia: Gerencia, tramo: Tramo) {
  return HORAS_BLOQUE * redondeo500(tramo.precioHora[gerencia] * (1 + RECARGO_BLOQUE));
}

export interface Linea {
  id: string;
  concepto: string;
  monto: number;
}

export interface Cotizacion {
  lineas: Linea[];
  total: number;
}

const nombreGerencia = (g: Gerencia) => (g === "general" ? "Gerente General" : "otras gerencias");

export function cotizarPlan({
  gerencia,
  horas,
  modalidad,
  primeraContratacion,
}: {
  gerencia: Gerencia;
  horas: number;
  modalidad: Modalidad;
  primeraContratacion: boolean;
}): Cotizacion & { tramo: Tramo; pisoAplicado: boolean } {
  const { tramo, monto, pisoAplicado } = mensualidad(gerencia, horas);
  const base = `Plan ${tramo.nombre}, ${horas} h al mes de ${nombreGerencia(gerencia)}`;
  const lineas: Linea[] =
    modalidad === "anual"
      ? [{ id: `anual-${tramo.id}`, concepto: `${base}, anual (12 meses, 10% de descuento)`, monto: Math.round(monto * 12 * (1 - DESCUENTO_ANUAL)) }]
      : [{ id: `mensual-${tramo.id}`, concepto: `${base}, mensual`, monto }];
  if (primeraContratacion) lineas.push({ id: "fee-match", concepto: "Fee de match (pago único)", monto: FEE_MATCH_PYME });
  return { lineas, total: lineas.reduce((s, l) => s + l.monto, 0), tramo, pisoAplicado };
}

export function cotizarBloques({ gerencia, tramo, cantidad }: { gerencia: Gerencia; tramo: Tramo; cantidad: number }): Cotizacion {
  const monto = cantidad * precioBloque(gerencia, tramo);
  const lineas = [
    {
      id: `bloque-${tramo.id}`,
      concepto: `${cantidad * HORAS_BLOQUE} h adicionales de ${nombreGerencia(gerencia)} (plan ${tramo.nombre}, ${cantidad} bloque${cantidad > 1 ? "s" : ""} de 5 h)`,
      monto,
    },
  ];
  return { lineas, total: monto };
}

export function formatoCLP(monto: number) {
  return "$" + monto.toLocaleString("es-CL");
}
