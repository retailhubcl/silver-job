import { ImageResponse } from "next/og";
import sharp from "sharp";
import { obtener } from "@/lib/redes/almacen";

export const dynamic = "force-dynamic";

// Imagen de marca de cada publicación: /api/redes/imagen/<id>.jpg (Instagram exige JPEG) o .png (LinkedIn)
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: crudo } = await params;
  const [id, formato = "jpg"] = crudo.split(".");
  if (!/^[0-9a-f-]{36}$/.test(id) || (formato !== "jpg" && formato !== "png")) return new Response("No encontrada", { status: 404 });
  const p = await obtener(id);
  if (!p) return new Response("No encontrada", { status: 404 });

  const ancho = 1080;
  const alto = p.red === "instagram" ? 1350 : 1080;
  const largo = p.titular.length > 48 ? 64 : 76;

  const png = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 96, background: "#16202A", color: "#F7F8FA" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, color: "#C9D0D7", letterSpacing: 1 }}>
          <div style={{ width: 64, height: 64, border: "3px solid #7D8894", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, color: "#F7F8FA" }}>S</div>
          Silver Job
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          <div style={{ width: 160, height: 10, background: "linear-gradient(90deg,#F7F8FA,#C9D0D7,#8E99A5)", display: "flex" }} />
          <div style={{ fontSize: largo, lineHeight: 1.12, fontWeight: 700, display: "flex" }}>{p.titular}</div>
          {p.bajada ? <div style={{ fontSize: 38, lineHeight: 1.3, color: "#A9B2BC", display: "flex" }}>{p.bajada}</div> : null}
        </div>
        <div style={{ fontSize: 34, color: "#A9B2BC", display: "flex" }}>silverjob.cl</div>
      </div>
    ),
    { width: ancho, height: alto },
  );

  const bytes = Buffer.from(await png.arrayBuffer());
  const salida = formato === "jpg" ? await sharp(bytes).jpeg({ quality: 92 }).toBuffer() : bytes;
  return new Response(new Uint8Array(salida), {
    headers: { "Content-Type": formato === "jpg" ? "image/jpeg" : "image/png", "Cache-Control": "public, max-age=300" },
  });
}
