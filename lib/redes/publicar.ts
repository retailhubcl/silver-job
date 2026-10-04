import * as almacen from "./almacen.ts";
import { generar, elegirTema } from "./generar.ts";
import { siguienteVentana } from "./fechas.ts";
import { instagramHabilitado, publicarEnInstagram } from "./instagram.ts";
import { linkedinHabilitado, publicarEnLinkedin } from "./linkedin.ts";
import { REDES, type Publicacion, type Red } from "./tipos.ts";

export function urlSitio() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://silverjob.cl").replace(/\/$/, "");
}

export const urlImagen = (id: string, formato: "jpg" | "png" = "jpg") => `${urlSitio()}/api/redes/imagen/${id}.${formato}`;

export function redConectada(red: Red) {
  return red === "linkedin" ? linkedinHabilitado() : instagramHabilitado();
}

async function enviar(p: Publicacion): Promise<string> {
  if (!redConectada(p.red)) throw new Error(`${p.red} no tiene credenciales configuradas`);
  if (p.red === "instagram") return publicarEnInstagram(urlImagen(p.id), p.texto);
  const imagen = await fetch(urlImagen(p.id, "png"));
  if (!imagen.ok) throw new Error(`No se pudo generar la imagen (${imagen.status})`);
  return publicarEnLinkedin(p.texto, { bytes: await imagen.arrayBuffer(), alt: p.titular });
}

// Publica una pieza ya reservada; deja el resultado (o el error) registrado
export async function publicar(id: string): Promise<Publicacion | null> {
  const p = await almacen.reservar(id);
  if (!p) return null; // otra ejecución la tomó o ya está publicada
  try {
    const idExterno = await enviar(p);
    return await almacen.actualizar(id, { estado: "publicado", publicada_en: new Date().toISOString(), id_externo: idExterno || null, error: null });
  } catch (e) {
    return await almacen.actualizar(id, { estado: "error", error: e instanceof Error ? e.message : String(e) });
  }
}

export async function publicarVencidas(ahora = new Date()) {
  const vencidas = await almacen.programadasHasta(ahora);
  const resultados: { id: string; red: Red; estado: string }[] = [];
  for (const v of vencidas) {
    const r = await publicar(v.id);
    if (r) resultados.push({ id: r.id, red: r.red, estado: r.estado });
  }
  return resultados;
}

// Mantiene siempre `minimo` piezas por red en cola, con el siguiente tema de la rotación
export async function reponerCola(opciones: { minimo: number; aprobar: boolean; ahora?: Date }) {
  const ahora = opciones.ahora ?? new Date();
  const creadas: { id: string; red: Red }[] = [];
  for (const red of REDES) {
    const cola = await almacen.pendientesDe(red);
    const ocupadas = cola.flatMap((c) => (c.programada_para ? [new Date(c.programada_para)] : []));
    const usados = new Set(cola.map((c) => c.tema));
    for (let faltan = opciones.minimo - cola.length, desplazamiento = 0; faltan > 0; faltan--, desplazamiento++) {
      let tema = elegirTema(new Date(ahora.getTime() + desplazamiento * 86_400_000));
      for (let k = 1; usados.has(tema) && k <= 10; k++) tema = elegirTema(new Date(ahora.getTime() + (desplazamiento + k) * 86_400_000));
      usados.add(tema);
      const borrador = await generar(tema, red);
      const fecha = opciones.aprobar ? siguienteVentana(ahora, ocupadas) : null;
      if (fecha) ocupadas.push(fecha);
      const fila = await almacen.crear({
        red,
        tema,
        texto: borrador.texto,
        titular: borrador.titular,
        bajada: borrador.bajada,
        estado: fecha ? "programado" : "borrador",
        programada_para: fecha?.toISOString() ?? null,
      });
      creadas.push({ id: fila.id, red });
    }
  }
  return creadas;
}
