import type { Borrador, Estado, Publicacion, Red } from "./tipos.ts";

// Acceso a la tabla `publicaciones` de Supabase (ver supabase/redes.sql) por la API REST

export function almacenHabilitado() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function rest<T>(consulta: string, init: RequestInit = {}): Promise<T> {
  const url = process.env.SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !clave) throw new Error("Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY");
  const respuesta = await fetch(`${url.replace(/\/$/, "")}/rest/v1/publicaciones${consulta}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: clave,
      Authorization: `Bearer ${clave}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...init.headers,
    },
  });
  if (!respuesta.ok) throw new Error(`Supabase ${respuesta.status}: ${(await respuesta.text()).slice(0, 200)}`);
  return (await respuesta.json()) as T;
}

export const listar = (limite = 60) => rest<Publicacion[]>(`?select=*&order=creada_en.desc&limit=${limite}`);

export async function obtener(id: string) {
  const filas = await rest<Publicacion[]>(`?id=eq.${encodeURIComponent(id)}&select=*`);
  return filas[0] ?? null;
}

export async function crear(datos: Borrador & { red: Red; tema: string; estado?: Estado; programada_para?: string | null }) {
  const filas = await rest<Publicacion[]>("", { method: "POST", body: JSON.stringify(datos) });
  return filas[0];
}

export async function actualizar(id: string, cambios: Partial<Publicacion>) {
  const filas = await rest<Publicacion[]>(`?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(cambios) });
  return filas[0] ?? null;
}

export async function eliminar(id: string) {
  await rest(`?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
}

export const programadasHasta = (ahora: Date) =>
  rest<Publicacion[]>(`?estado=eq.programado&programada_para=lte.${encodeURIComponent(ahora.toISOString())}&order=programada_para.asc&limit=10`);

export const pendientesDe = (red: Red) =>
  rest<Publicacion[]>(`?red=eq.${red}&estado=in.(borrador,programado)&select=*&order=creada_en.desc`);

// Reserva la publicación de forma atómica: solo una ejecución pasa de programado/borrador/error a publicando
export async function reservar(id: string) {
  const filas = await rest<Publicacion[]>(`?id=eq.${encodeURIComponent(id)}&estado=in.(borrador,programado,error)`, {
    method: "PATCH",
    body: JSON.stringify({ estado: "publicando", error: null }),
  });
  return filas[0] ?? null;
}
