// Planes mensuales de Silver Job. Los precios (CLP, monto que se cobra) vienen de variables
// de entorno para poder publicarlos sin cambiar código; un plan sin precio no se vende.
export type IdPlan = "basico" | "estandar" | "intensivo";

export interface Plan {
  id: IdPlan;
  nombre: string;
  horas: string;
  precio: number | null;
}

const BASE: Omit<Plan, "precio">[] = [
  { id: "basico", nombre: "Básico", horas: "Hasta 10 horas al mes" },
  { id: "estandar", nombre: "Estándar", horas: "De 11 a 25 horas al mes" },
  { id: "intensivo", nombre: "Intensivo", horas: "De 26 a 40 horas al mes" },
];

const VARIABLE: Record<IdPlan, string> = {
  basico: "PRECIO_PLAN_BASICO",
  estandar: "PRECIO_PLAN_ESTANDAR",
  intensivo: "PRECIO_PLAN_INTENSIVO",
};

export function leerPrecio(valor: string | undefined): number | null {
  if (!valor) return null;
  const n = Number(valor.replace(/[.\s$]/g, ""));
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function planes(env: Record<string, string | undefined> = process.env): Plan[] {
  return BASE.map((p) => ({ ...p, precio: leerPrecio(env[VARIABLE[p.id]]) }));
}

export function planesALaVenta(env: Record<string, string | undefined> = process.env) {
  return planes(env).filter((p): p is Plan & { precio: number } => p.precio !== null);
}

export function formatoCLP(monto: number) {
  return "$" + monto.toLocaleString("es-CL");
}
