export type Red = "linkedin" | "instagram";
export type Estado = "borrador" | "programado" | "publicando" | "publicado" | "error";

export const REDES: Red[] = ["linkedin", "instagram"];
export const NOMBRE_RED: Record<Red, string> = { linkedin: "LinkedIn", instagram: "Instagram" };

// Límites de cada red
export const LIMITE_TEXTO: Record<Red, number> = { linkedin: 3000, instagram: 2200 };
export const LIMITE_TITULAR = 70;
export const LIMITE_BAJADA = 120;

export interface Borrador {
  texto: string;
  titular: string;
  bajada: string;
}

export interface Publicacion extends Borrador {
  id: string;
  red: Red;
  tema: string;
  estado: Estado;
  programada_para: string | null;
  publicada_en: string | null;
  id_externo: string | null;
  error: string | null;
  creada_en: string;
}
