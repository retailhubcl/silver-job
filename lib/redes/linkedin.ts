// Publicación en LinkedIn con la Posts API (https://learn.microsoft.com/linkedin/marketing/community-management/shares/posts-api)

export function linkedinHabilitado() {
  return Boolean(process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_AUTOR);
}

// El campo "commentary" usa un formato donde estos caracteres son reservados; los hashtags (#palabra) se dejan intactos
export function escaparLinkedin(texto: string): string {
  return texto.replace(/[\\|{}@[\]()<>*_~]/g, "\\$&").replace(/#(?!\p{L}|\p{N}|_)/gu, "\\#");
}

function cabeceras(extra: Record<string, string> = {}) {
  return {
    Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
    "LinkedIn-Version": process.env.LINKEDIN_VERSION ?? "202506",
    "X-Restli-Protocol-Version": "2.0.0",
    ...extra,
  };
}

async function subirImagen(autor: string, imagen: ArrayBuffer): Promise<string> {
  const inicio = await fetch("https://api.linkedin.com/rest/images?action=initializeUpload", {
    method: "POST",
    headers: cabeceras({ "Content-Type": "application/json" }),
    body: JSON.stringify({ initializeUploadRequest: { owner: autor } }),
  });
  if (!inicio.ok) throw new Error(`LinkedIn (imagen) ${inicio.status}: ${(await inicio.text()).slice(0, 200)}`);
  const { value } = (await inicio.json()) as { value: { uploadUrl: string; image: string } };
  const subida = await fetch(value.uploadUrl, { method: "PUT", headers: cabeceras({ "Content-Type": "application/octet-stream" }), body: imagen });
  if (!subida.ok) throw new Error(`LinkedIn (subida) ${subida.status}`);
  return value.image;
}

export async function publicarEnLinkedin(texto: string, imagen?: { bytes: ArrayBuffer; alt: string }): Promise<string> {
  const autor = process.env.LINKEDIN_AUTOR!; // urn:li:organization:123 o urn:li:person:abc
  const cuerpo: Record<string, unknown> = {
    author: autor,
    commentary: escaparLinkedin(texto),
    visibility: "PUBLIC",
    distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
  };
  if (imagen) cuerpo.content = { media: { id: await subirImagen(autor, imagen.bytes), altText: imagen.alt } };

  const respuesta = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: cabeceras({ "Content-Type": "application/json" }),
    body: JSON.stringify(cuerpo),
  });
  if (!respuesta.ok) throw new Error(`LinkedIn ${respuesta.status}: ${(await respuesta.text()).slice(0, 200)}`);
  return respuesta.headers.get("x-restli-id") ?? "";
}
