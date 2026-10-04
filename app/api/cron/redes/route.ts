import { NextResponse } from "next/server";
import { almacenHabilitado } from "@/lib/redes/almacen";
import { publicarVencidas, reponerCola } from "@/lib/redes/publicar";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Vercel Cron (vercel.json) llama aquí en días hábiles. Requiere CRON_SECRET, que Vercel envía como Bearer.
export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || request.headers.get("authorization") !== `Bearer ${secreto}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!almacenHabilitado()) return NextResponse.json({ error: "Falta configurar Supabase" }, { status: 503 });

  const publicadas = await publicarVencidas();
  // REDES_AUTOGENERAR=1 mantiene la cola llena; REDES_AUTOAPROBAR=1 las programa sin revisión previa
  const creadas =
    process.env.REDES_AUTOGENERAR === "1"
      ? await reponerCola({ minimo: Number(process.env.REDES_COLA_MINIMA ?? 3), aprobar: process.env.REDES_AUTOAPROBAR === "1" })
      : [];
  console.info("cron_redes", { publicadas, creadas: creadas.length });
  return NextResponse.json({ publicadas, creadas });
}
