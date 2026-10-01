"use client";

import { track } from "@vercel/analytics";
import { elegirTipo, type TipoRegistro } from "@/lib/eventos";

export default function EnlaceRegistro({
  tipo,
  className,
  onClick,
  children,
}: {
  tipo: TipoRegistro;
  className: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <a
      className={className}
      href="#lista"
      onClick={() => {
        elegirTipo(tipo);
        onClick?.();
        track("clic_registro", { tipo });
      }}
    >
      {children}
    </a>
  );
}
