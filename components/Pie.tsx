import Anillo from "@/components/Anillo";

export default function Pie() {
  return (
    <footer className="pie">
      <div className="contenedor">
        <div className="pie-marca">
          <a className="marca" href="/" aria-label="silverjob, ir al inicio"><Anillo /><span className="palabra">silverjob</span></a>
          <p>Silver Job nace en Santiago para conectar la experiencia de ejecutivos senior con pymes que quieren crecer.</p>
        </div>
        <div className="pie-enlaces">
          <a href="mailto:tomas@silverjob.cl">tomas@silverjob.cl</a>
          <a href="/privacidad">Política de privacidad</a>
          <span>© 2026 Silver Job, Santiago, Chile</span>
        </div>
      </div>
    </footer>
  );
}
