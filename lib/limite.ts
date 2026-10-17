// Límite de envíos por IP en memoria. En Vercel cada instancia lleva su propia cuenta,
// así que es una defensa de mejor esfuerzo: la barrera firme es la regla de límite de
// tasa del WAF de Vercel (ver docs/seguridad.md).
const ventanas = new Map<string, number[]>();

export function permitido(clave: string, maximo: number, ventanaMs: number, ahora = Date.now()): boolean {
  const recientes = (ventanas.get(clave) ?? []).filter((t) => ahora - t < ventanaMs);
  if (recientes.length >= maximo) {
    ventanas.set(clave, recientes);
    return false;
  }
  recientes.push(ahora);
  ventanas.set(clave, recientes);
  if (ventanas.size > 5000) {
    for (const [k, v] of ventanas) if (v.every((t) => ahora - t >= ventanaMs)) ventanas.delete(k);
  }
  return true;
}

export function ipDe(request: Request): string {
  const reenviada = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return request.headers.get("x-real-ip") ?? reenviada ?? "desconocida";
}

export function _reiniciar() {
  ventanas.clear();
}
