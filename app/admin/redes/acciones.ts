"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as almacen from "@/lib/redes/almacen";
import { desdeSantiago, siguienteVentana } from "@/lib/redes/fechas";
import { generar, elegirTema } from "@/lib/redes/generar";
import { publicar } from "@/lib/redes/publicar";
import { claveCorrecta, COOKIE, sesionValida, tokenSesion } from "@/lib/redes/sesion";
import { LIMITE_BAJADA, LIMITE_TEXTO, LIMITE_TITULAR, REDES, type Red } from "@/lib/redes/tipos";

const RUTA = "/admin/redes";

async function exigirSesion() {
  const jar = await cookies();
  if (!sesionValida(jar.get(COOKIE)?.value, process.env.ADMIN_REDES_CLAVE)) redirect(RUTA);
}

const campo = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const aviso = (mensaje: string): never => redirect(`${RUTA}?aviso=${encodeURIComponent(mensaje)}`);

export async function entrar(f: FormData) {
  const clave = process.env.ADMIN_REDES_CLAVE;
  if (!clave || !claveCorrecta(campo(f, "clave"), clave)) redirect(`${RUTA}?aviso=${encodeURIComponent("Clave incorrecta")}`);
  (await cookies()).set(COOKIE, tokenSesion(clave!), { httpOnly: true, secure: true, sameSite: "lax", path: "/admin", maxAge: 60 * 60 * 24 * 14 });
  redirect(RUTA);
}

export async function salir() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
  redirect(RUTA);
}

export async function generarAccion(f: FormData) {
  await exigirSesion();
  const tema = campo(f, "tema") || elegirTema(new Date());
  const redes = REDES.filter((r) => campo(f, "red") === "ambas" || campo(f, "red") === r);
  if (redes.length === 0) return aviso("Elige una red");
  try {
    for (const red of redes) {
      const b = await generar(tema.slice(0, 300), red);
      await almacen.crear({ red, tema: tema.slice(0, 300), texto: b.texto, titular: b.titular, bajada: b.bajada });
    }
  } catch (e) {
    return aviso(e instanceof Error ? e.message : "No se pudo generar");
  }
  revalidatePath(RUTA);
  redirect(RUTA);
}

// Guarda ediciones y, según el botón, programa, publica ahora o descarta
export async function gestionar(f: FormData) {
  await exigirSesion();
  const id = campo(f, "id");
  const accion = campo(f, "accion");
  const actual = await almacen.obtener(id);
  if (!actual) return aviso("La publicación ya no existe");
  if (actual.estado === "publicado" || actual.estado === "publicando") return aviso("Esa publicación ya salió");

  if (accion === "descartar") {
    await almacen.eliminar(id);
    revalidatePath(RUTA);
    redirect(RUTA);
  }

  const texto = campo(f, "texto").slice(0, LIMITE_TEXTO[actual.red as Red]);
  if (!texto) return aviso("El texto no puede quedar vacío");
  const cambios = { texto, titular: campo(f, "titular").slice(0, LIMITE_TITULAR), bajada: campo(f, "bajada").slice(0, LIMITE_BAJADA) };

  if (accion === "ahora") {
    await almacen.actualizar(id, { ...cambios, estado: "borrador" });
    const r = await publicar(id);
    revalidatePath(RUTA);
    return aviso(r?.estado === "publicado" ? "Publicada" : `No se pudo publicar: ${r?.error ?? "ya estaba en curso"}`);
  }

  if (accion === "programar") {
    const pedida = campo(f, "cuando") ? desdeSantiago(campo(f, "cuando")) : null;
    if (campo(f, "cuando") && !pedida) return aviso("La fecha no es válida");
    let fecha = pedida;
    if (!fecha) {
      const cola = await almacen.pendientesDe(actual.red as Red);
      fecha = siguienteVentana(new Date(), cola.flatMap((c) => (c.id !== id && c.programada_para ? [new Date(c.programada_para)] : [])));
    }
    await almacen.actualizar(id, { ...cambios, estado: "programado", programada_para: fecha.toISOString(), error: null });
  } else {
    await almacen.actualizar(id, { ...cambios, estado: "borrador", programada_para: null });
  }
  revalidatePath(RUTA);
  redirect(RUTA);
}
