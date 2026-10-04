import { LIMITE_BAJADA, LIMITE_TEXTO, LIMITE_TITULAR, type Borrador, type Red } from "./tipos.ts";

// Temas que rotan para sostener la línea editorial sin que Tomás escriba cada post
export const TEMAS = [
  "La experiencia no se jubila: ejecutivos senior que siguen aportando",
  "Cuándo una pyme necesita un gerente por horas y no uno a tiempo completo",
  "Gerente full time versus gerente fraccional: qué cambia en el costo mensual",
  "Cómo funciona Silver Job en tres pasos",
  "Un mismo ejecutivo atendiendo a varias pymes (caso ilustrativo)",
  "Pymes que crecieron más rápido que su equipo de gestión: señales de alerta",
  "Preguntas frecuentes: horas no usadas, confidencialidad y responsabilidad del trabajo",
  "Para ejecutivos: tu próximo desafío, a tu ritmo y con tu valor hora",
  "Qué se puede resolver en 10 horas al mes con un gerente de operaciones, finanzas o comercial",
  "Por qué pagar solo a Silver Job: sin matrícula, comisiones ni fees",
];

export function elegirTema(fecha: Date): string {
  const dia = Math.floor(fecha.getTime() / 86_400_000);
  return TEMAS[dia % TEMAS.length];
}

const REGLAS = `Eres el redactor de Silver Job (silverjob.cl), marketplace chileno de gerentes fraccionales: ejecutivos C-Level senior ("generación silver") que atienden por horas a pymes que no pueden contratar un gerente a tiempo completo. Un mismo ejecutivo puede atender a varias pymes.

Reglas de redacción, obligatorias:
- Español de Chile (es-CL), tono cercano pero formal, sin jerga ni anglicismos innecesarios.
- Verbo único para invitar: "Súmate" (por ejemplo "Súmate a la lista en silverjob.cl").
- Trata a los ejecutivos con dignidad: son elegidos, no rescatados. Nunca digas que "el mercado dejó de llamarlos" ni nada parecido.
- No inventes cifras, clientes, testimonios, premios ni resultados. Si das un ejemplo, di que es ilustrativo.
- Nadie está certificado todavía: no atribuyas el sello "Plata certificada" a nadie.
- Si mencionas precios: los precios a la pyme incluyen IVA; los planes son Básico (1 a 10 h), Estándar (11 a 26 h) e Intensivo (27 a 40 h); no hay matrícula, comisiones ni fees. Solo cita montos exactos si el tema los entrega.
- Comparación de costo, si la usas: gerente full time $6,7 a $9,8 millones al mes (guía salarial Robert Half Chile) frente a un plan Estándar de 18 h, unos $1,7 millones con IVA. Dilo como estimación referencial.
- Las horas se contratan hasta el día 5 de cada mes y no se acumulan.
- Cierra con una invitación concreta a silverjob.cl o a escribir a tomas@silverjob.cl.`;

const FORMATO: Record<Red, string> = {
  linkedin: `Formato LinkedIn: gancho en la primera línea, párrafos de 1 a 3 líneas separados por una línea en blanco, entre 900 y 1.600 caracteres, máximo 3 hashtags al final. Puedes usar el enlace silverjob.cl.`,
  instagram: `Formato Instagram: pie de foto de 400 a 900 caracteres, primera línea que enganche, párrafos cortos, algunos emojis sobrios (máximo 3), sin enlaces clicables (di "link en la bio" o "silverjob.cl"), de 5 a 8 hashtags al final.`,
};

export function construirPrompt(tema: string, red: Red) {
  return {
    system: REGLAS,
    user: `Escribe una publicación para ${red === "linkedin" ? "LinkedIn" : "Instagram"} sobre este tema: ${tema}

${FORMATO[red]}

Responde SOLO con un JSON válido, sin texto adicional, con estas claves:
- "texto": el texto completo de la publicación.
- "titular": frase corta para la imagen (máximo ${LIMITE_TITULAR} caracteres, sin punto final).
- "bajada": una línea de apoyo para la imagen (máximo ${LIMITE_BAJADA} caracteres).`,
  };
}

const recortar = (s: string, max: number) => (s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`);

export function parsearRespuesta(bruto: string, red: Red): Borrador {
  const ini = bruto.indexOf("{");
  const fin = bruto.lastIndexOf("}");
  if (ini < 0 || fin <= ini) throw new Error("La respuesta no trae JSON");
  const datos = JSON.parse(bruto.slice(ini, fin + 1)) as Record<string, unknown>;
  const campo = (k: string) => (typeof datos[k] === "string" ? (datos[k] as string).trim() : "");
  const texto = campo("texto");
  const titular = campo("titular");
  if (!texto || !titular) throw new Error("Faltan 'texto' o 'titular' en la respuesta");
  return {
    texto: recortar(texto, LIMITE_TEXTO[red]),
    titular: recortar(titular, LIMITE_TITULAR),
    bajada: recortar(campo("bajada"), LIMITE_BAJADA),
  };
}

// Texto base si no hay clave de Claude: la publicación sale simple, pero sale
export function plantilla(tema: string, red: Red): Borrador {
  const cierre = red === "linkedin" ? "Súmate a la lista en silverjob.cl" : "Súmate a la lista: link en la bio (silverjob.cl)";
  const hashtags = red === "linkedin" ? "#GerenciaFraccional #Pymes #Chile" : "#GerenciaFraccional #Pymes #Chile #Emprendedores #SilverJob";
  return {
    texto: `${tema}.\n\nEn Silver Job conectamos a ejecutivos senior con pymes que necesitan gestión de alto nivel, pero por horas.\n\n${cierre}\n\n${hashtags}`,
    titular: recortar(tema, LIMITE_TITULAR),
    bajada: "Gerentes fraccionales para pymes chilenas",
  };
}

export function generacionConClaude() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function generar(tema: string, red: Red): Promise<Borrador & { fuente: "claude" | "plantilla" }> {
  const clave = process.env.ANTHROPIC_API_KEY;
  if (!clave) return { ...plantilla(tema, red), fuente: "plantilla" };
  const { system, user } = construirPrompt(tema, red);
  const respuesta = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": clave, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5",
      max_tokens: 1500,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!respuesta.ok) throw new Error(`Claude ${respuesta.status}: ${(await respuesta.text()).slice(0, 200)}`);
  const cuerpo = (await respuesta.json()) as { content?: { type: string; text?: string }[] };
  const texto = cuerpo.content?.filter((b) => b.type === "text").map((b) => b.text).join("") ?? "";
  return { ...parsearRespuesta(texto, red), fuente: "claude" };
}
