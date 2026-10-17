// Cliente mínimo de la API REST de Supabase (PostgREST), solo para el servidor.
// Usa la clave secreta (SUPABASE_SECRET_KEY), que NUNCA debe llevar el prefijo NEXT_PUBLIC_.
// Las tablas tienen RLS activado y sin políticas: solo esta clave puede leerlas o escribirlas.
export function supabaseActivo() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

export async function upsert(
  tabla: string,
  fila: Record<string, unknown>,
  conflicto: string,
): Promise<void> {
  const base = process.env.SUPABASE_URL;
  const clave = process.env.SUPABASE_SECRET_KEY;
  if (!base || !clave) throw new Error("Supabase no está configurado");
  const r = await fetch(`${base.replace(/\/$/, "")}/rest/v1/${tabla}?on_conflict=${encodeURIComponent(conflicto)}`, {
    method: "POST",
    headers: {
      apikey: clave,
      Authorization: `Bearer ${clave}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(fila),
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`Supabase ${tabla}: ${r.status} ${(await r.text()).slice(0, 300)}`);
}
