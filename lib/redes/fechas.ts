const ZONA = "America/Santiago";

function desfase(fecha: Date): number {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(fecha);
  const n = (t: string) => Number(partes.find((p) => p.type === t)?.value);
  return Date.UTC(n("year"), n("month") - 1, n("day"), n("hour"), n("minute"), n("second")) - Math.floor(fecha.getTime() / 1000) * 1000;
}

// "2026-10-05T09:00" (hora de Chile) -> instante real
export function desdeSantiago(local: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!m) return null;
  const [a, mes, d, h, min] = m.slice(1).map(Number);
  const nominal = Date.UTC(a, mes - 1, d, h, min);
  let t = nominal - desfase(new Date(nominal));
  t = nominal - desfase(new Date(t));
  return Number.isNaN(t) ? null : new Date(t);
}

// instante -> "2026-10-05T09:00" en hora de Chile (para input datetime-local)
export function aSantiago(fecha: Date): string {
  const t = new Date(fecha.getTime() + desfase(fecha));
  return t.toISOString().slice(0, 16);
}

export function formatear(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("es-CL", { timeZone: ZONA, dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

// Próxima ventana de publicación: día hábil a las 09:00 (Chile) sin otra publicación de la misma red ese día
export function siguienteVentana(desde: Date, ocupadas: Date[]): Date {
  const dias = new Set(ocupadas.map((o) => aSantiago(o).slice(0, 10)));
  const cursor = new Date(desde);
  for (let i = 0; i < 60; i++) {
    const dia = aSantiago(cursor).slice(0, 10);
    const semana = new Date(`${dia}T12:00:00Z`).getUTCDay();
    const ventana = desdeSantiago(`${dia}T09:00`)!;
    if (semana !== 0 && semana !== 6 && !dias.has(dia) && ventana > desde) return ventana;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  throw new Error("No se encontró una ventana de publicación");
}
