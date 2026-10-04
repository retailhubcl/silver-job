import type { Metadata } from "next";
import Encabezado from "@/components/Encabezado";
import Pie from "@/components/Pie";

export const metadata: Metadata = {
  title: "Página no encontrada | Silver Job",
  robots: { index: false },
};

export default function NoEncontrada() {
  return (
    <>
      <Encabezado enPortada={false} />
      <main className="simple" id="contenido" tabIndex={-1}>
        <h1>No encontramos esta página</h1>
        <p>Puede que el enlace esté incompleto o que la página ya no exista.</p>
        <p className="acciones">
          <a className="boton" href="/">Ir al inicio</a>
          <a className="boton secundario" href="/#lista">Súmate a la lista</a>
        </p>
        <p>¿Buscabas algo en particular? Escríbenos a <a href="mailto:tomas@silverjob.cl">tomas@silverjob.cl</a>.</p>
      </main>
      <Pie />
    </>
  );
}
