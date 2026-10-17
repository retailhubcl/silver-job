// Validación del formulario de la lista de espera, con mensajes propios en español.
import type { TipoRegistro } from "./eventos.ts";
import { limpiar } from "./sanitizar.ts";

export type Errores = Partial<Record<string, string>>;

// Campos en el orden en que aparecen en el formulario (para llevar el foco al primero con error)
export const ORDEN: Record<TipoRegistro, string[]> = {
  pyme: ["nombre", "correo", "empresa", "area", "horas", "consentimiento"],
  ejecutivo: ["nombre", "correo", "linkedin", "area", "anios", "consentimiento"],
};

// Exige dominio con punto: "ana@pyme" no es válido, "ana@pyme.cl" sí
const CORREO = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function normalizarLinkedin(valor: string) {
  const v = valor.trim();
  return v && !/^https?:\/\//i.test(v) ? "https://" + v : v;
}

export function validarRegistro(datos: Record<string, string | undefined>, tipo: TipoRegistro): Errores {
  const v = (k: string) => (datos[k] ?? "").trim();
  const e: Errores = {};
  if (!v("nombre")) e.nombre = "Escribe tu nombre.";
  if (!v("correo")) e.correo = "Escribe tu correo.";
  else if (!CORREO.test(v("correo"))) e.correo = "Revisa el correo: debe verse como nombre@empresa.cl.";
  if (tipo === "pyme") {
    if (!v("empresa")) e.empresa = "Escribe el nombre de tu empresa.";
    if (!v("area")) e.area = "Elige la gerencia que necesitas.";
    if (!v("horas")) e.horas = "Elige un rango de horas.";
  } else {
    if (!v("linkedin")) e.linkedin = "Pega la dirección de tu perfil de LinkedIn.";
    else if (!/linkedin\.com\/in\/[^/\s]+/i.test(v("linkedin")))
      e.linkedin = "Debe ser la dirección de tu perfil, por ejemplo linkedin.com/in/tu-nombre.";
    if (!v("area")) e.area = "Elige tu área de experiencia.";
    if (!v("anios")) e.anios = "Elige tus años de experiencia.";
  }
  if (v("consentimiento") !== "si") e.consentimiento = "Marca la casilla para que podamos contactarte.";
  return e;
}

// ---- Validación en el servidor (/api/lista) ----
// Nunca se confía en la validación del navegador: aquí se vuelven a revisar los largos,
// las opciones permitidas y el formato, y se limpian los textos.
export const AREAS = ["Gerencia general", "Operaciones", "Marketing", "Finanzas", "Comercial", "Otra"];
export const HORAS = ["Hasta 10 (Básico)", "Entre 11 y 26 (Estándar)", "Entre 27 y 40 (Intensivo)", "Aún no lo sé"];
export const ANIOS = ["Entre 10 y 20", "Entre 20 y 30", "Más de 30"];

export const VERSION_CONSENTIMIENTO = "privacidad-2026-10";

const LINKEDIN = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[^\s/?#]+\/?([?#]\S*)?$/i;

export interface Registro {
  tipo: TipoRegistro;
  nombre: string;
  correo: string;
  empresa: string | null;
  area: string;
  horas: string | null;
  linkedin: string | null;
  anios: string | null;
}

export function validarServidor(entrada: Record<string, unknown>): { registro: Registro } | { error: string } {
  const tipo = entrada.tipo === "ejecutivo" ? "ejecutivo" : entrada.tipo === "pyme" ? "pyme" : null;
  if (!tipo) return { error: "tipo" };
  const t = (k: string, max: number) => limpiar(entrada[k], max);
  const datos = {
    nombre: t("nombre", 120),
    correo: t("correo", 254).toLowerCase(),
    empresa: t("empresa", 160),
    area: t("area", 40),
    horas: t("horas", 40),
    linkedin: normalizarLinkedin(t("linkedin", 200)),
    anios: t("anios", 40),
    consentimiento: t("consentimiento", 5),
  };
  const errores = validarRegistro(datos, tipo);
  const primero = Object.keys(errores)[0];
  if (primero) return { error: primero };
  if (!AREAS.includes(datos.area)) return { error: "area" };
  if (tipo === "pyme" && !HORAS.includes(datos.horas)) return { error: "horas" };
  if (tipo === "ejecutivo") {
    if (!ANIOS.includes(datos.anios)) return { error: "anios" };
    if (!LINKEDIN.test(datos.linkedin)) return { error: "linkedin" };
  }
  return {
    registro: {
      tipo,
      nombre: datos.nombre,
      correo: datos.correo,
      empresa: tipo === "pyme" ? datos.empresa : null,
      area: datos.area,
      horas: tipo === "pyme" ? datos.horas : null,
      linkedin: tipo === "ejecutivo" ? datos.linkedin : null,
      anios: tipo === "ejecutivo" ? datos.anios : null,
    },
  };
}
