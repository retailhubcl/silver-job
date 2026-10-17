import { NextResponse } from "next/server";
import { ipDe, permitido } from "@/lib/limite";
import { mismoOrigen } from "@/lib/origen";
import { neutralizarFormula } from "@/lib/sanitizar";
import { supabaseActivo, upsert } from "@/lib/supabase";
import { verificarTurnstile } from "@/lib/turnstile";
import { VERSION_CONSENTIMIENTO, validarServidor } from "@/lib/validacion";

// Apps Script anterior: solo se usa mientras Supabase no esté configurado.
const APPS_SCRIPT =
  process.env.LISTA_ENDPOINT ??
  process.env.NEXT_PUBLIC_LISTA_ENDPOINT ??
  "https://script.google.com/macros/s/AKfycbw9Np-Q-NXn1vAJLqxbbgqyIYjTI8gS5pbItaat_oL4s_3Z1MMuSQgNzQtKq3HFOg_E/exec";

const respuesta = (cuerpo: Record<string, unknown>, status = 200) => NextResponse.json(cuerpo, { status });

// Recibe el formulario de la lista de espera. Toda la validación se repite aquí.
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return respuesta({ result: "error", error: "origen" }, 403);

  const ip = ipDe(request);
  if (!permitido(`lista:${ip}`, 5, 10 * 60_000)) return respuesta({ result: "error", error: "limite" }, 429);

  const form = await request.formData().catch(() => null);
  if (!form) return respuesta({ result: "error", error: "formato" }, 400);
  const entrada = Object.fromEntries(form) as Record<string, unknown>;

  // Campo trampa: si viene lleno es un bot; se responde éxito sin guardar
  if (entrada.sitio) return respuesta({ result: "success" });

  const valido = validarServidor(entrada);
  if ("error" in valido) return respuesta({ result: "error", error: valido.error }, 400);

  if (!(await verificarTurnstile(String(entrada["cf-turnstile-response"] ?? ""), ip))) {
    return respuesta({ result: "error", error: "captcha" }, 400);
  }

  const r = valido.registro;
  try {
    if (supabaseActivo()) {
      await upsert(
        "lista_espera",
        { ...r, consentimiento: true, consentimiento_version: VERSION_CONSENTIMIENTO },
        "tipo,correo",
      );
    } else {
      // Respaldo hasta migrar: se reenvía al Apps Script con los textos neutralizados
      const cuerpo = new URLSearchParams({ consentimiento: "si" });
      for (const [k, v] of Object.entries(r)) cuerpo.set(k, neutralizarFormula(v ?? ""));
      if (process.env.LISTA_TOKEN) cuerpo.set("clave", process.env.LISTA_TOKEN);
      const a = await fetch(APPS_SCRIPT, { method: "POST", body: cuerpo, signal: AbortSignal.timeout(10_000) });
      const datos = (await a.json()) as { result?: string };
      if (datos.result !== "success") throw new Error("Apps Script no confirmó el registro");
    }
    return respuesta({ result: "success" });
  } catch (e) {
    console.error("lista_error", e instanceof Error ? e.message : "desconocido");
    return respuesta({ result: "error", error: "guardado" }, 502);
  }
}
