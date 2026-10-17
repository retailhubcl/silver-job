// Verificación de Cloudflare Turnstile (captcha sin fricción).
// Si TURNSTILE_SECRET_KEY no está configurada, la verificación queda desactivada.
export function turnstileActivo() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verificarTurnstile(token: string | null | undefined, ip?: string): Promise<boolean> {
  const secreto = process.env.TURNSTILE_SECRET_KEY;
  if (!secreto) return true;
  if (!token || token.length > 2048) return false;
  try {
    const cuerpo = new URLSearchParams({ secret: secreto, response: token });
    if (ip && ip !== "desconocida") cuerpo.set("remoteip", ip);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: cuerpo,
      signal: AbortSignal.timeout(5000),
    });
    const datos = (await r.json()) as { success?: boolean };
    return datos.success === true;
  } catch {
    return false;
  }
}
