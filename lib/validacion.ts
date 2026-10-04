// Validación del formulario de la lista de espera, con mensajes propios en español.
import type { TipoRegistro } from "./eventos.ts";

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
