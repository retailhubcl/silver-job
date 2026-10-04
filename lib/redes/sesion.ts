import { createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE = "redes_sesion";

// El valor de la cookie es un HMAC de la clave: no revela la clave y cambia si ella cambia
export function tokenSesion(clave: string): string {
  return createHmac("sha256", clave).update("silverjob-redes-v1").digest("hex");
}

export function sesionValida(valor: string | undefined, clave: string | undefined): boolean {
  if (!valor || !clave) return false;
  const esperado = Buffer.from(tokenSesion(clave));
  const recibido = Buffer.from(valor);
  return recibido.length === esperado.length && timingSafeEqual(recibido, esperado);
}

export function claveCorrecta(intento: string, clave: string | undefined): boolean {
  if (!clave) return false;
  const a = createHmac("sha256", "cmp").update(intento).digest();
  const b = createHmac("sha256", "cmp").update(clave).digest();
  return timingSafeEqual(a, b);
}
