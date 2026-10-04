import type { Metadata } from "next";
import Encabezado from "@/components/Encabezado";
import Pie from "@/components/Pie";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Estado del pago | Silver Job",
  robots: { index: false },
};

const ESTADOS: Record<string, { titulo: string; texto: string }> = {
  exito: {
    titulo: "Pago recibido",
    texto: "Gracias. Te escribiremos al correo que usaste para coordinar la primera sesión con tu ejecutivo.",
  },
  pendiente: {
    titulo: "Pago en proceso",
    texto: "Mercado Pago está procesando tu pago. Te avisaremos por correo apenas se confirme.",
  },
  error: {
    titulo: "El pago no se completó",
    texto: "No se hizo ningún cargo. Puedes intentarlo de nuevo o escribirnos a tomas@silverjob.cl.",
  },
};

export default async function EstadoPago({ params }: { params: Promise<{ estado: string }> }) {
  const { estado } = await params;
  const info = ESTADOS[estado];
  if (!info) notFound();
  return (
    <>
      <Encabezado enPortada={false} />
      <main className="simple" id="contenido" tabIndex={-1}>
        <a className="volver" href="/">Volver a Silver Job</a>
        <h1>{info.titulo}</h1>
        <p>{info.texto}</p>
        {estado === "error" && <p><a className="boton" href="/pagar">Intentar de nuevo</a></p>}
      </main>
      <Pie />
    </>
  );
}
