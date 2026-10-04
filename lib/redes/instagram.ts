// Publicación en Instagram con la Instagram Graph API (cuenta profesional vinculada a una página de Facebook).
// La imagen debe ser una URL pública en JPEG.

const GRAPH = `https://graph.facebook.com/${process.env.INSTAGRAM_GRAPH_VERSION ?? "v23.0"}`;

export function instagramHabilitado() {
  return Boolean(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_USER_ID);
}

async function graph<T>(ruta: string, params: Record<string, string>, metodo: "GET" | "POST"): Promise<T> {
  const datos = new URLSearchParams({ ...params, access_token: process.env.INSTAGRAM_ACCESS_TOKEN! });
  const respuesta = await fetch(metodo === "GET" ? `${GRAPH}/${ruta}?${datos}` : `${GRAPH}/${ruta}`, {
    method: metodo,
    ...(metodo === "POST" ? { body: datos } : {}),
  });
  if (!respuesta.ok) throw new Error(`Instagram ${respuesta.status}: ${(await respuesta.text()).slice(0, 200)}`);
  return (await respuesta.json()) as T;
}

export async function publicarEnInstagram(urlImagen: string, pie: string): Promise<string> {
  const usuario = process.env.INSTAGRAM_USER_ID!;
  const { id: contenedor } = await graph<{ id: string }>(`${usuario}/media`, { image_url: urlImagen, caption: pie }, "POST");

  // Meta procesa la imagen en segundo plano: se espera a que quede lista
  for (let intento = 0; intento < 8; intento++) {
    const { status_code } = await graph<{ status_code: string }>(contenedor, { fields: "status_code" }, "GET");
    if (status_code === "FINISHED") break;
    if (status_code === "ERROR" || status_code === "EXPIRED") throw new Error(`Instagram no pudo procesar la imagen (${status_code})`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  const { id } = await graph<{ id: string }>(`${usuario}/media_publish`, { creation_id: contenedor }, "POST");
  return id;
}
