// Defensa contra CSRF: un POST desde el navegador debe venir del mismo sitio.
// Los navegadores siempre envían Origin en los POST de formularios; si falta o es de
// otro dominio, se rechaza.
export function mismoOrigen(request: Request): boolean {
  const origen = request.headers.get("origin");
  if (!origen) return false;
  const anfitrion = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origen).host === anfitrion;
  } catch {
    return false;
  }
}
