// Símbolo de Silver Job: la «S» del encuentro.
// Dibujada desde la «S» de Source Serif 4 (peso 700, tamaño óptico 60) con las puntas en corte limpio
// y partida en dos piezas por la columna central: la pyme y el ejecutivo que se encuentran.
// Los contornos están en unidades de la fuente; cada variante los ubica en una grilla de 32 × 32.
// Colores en globals.css (.simbolo y sus variables --s-*).

const ARRIBA = "M301.7 379.4Q300.6 380 299.4 380.6L270.1 396.2Q239.2 412.9 212.1 431.2Q185.1 449.5 168.8 473.8Q152.5 498.2 152.5 532Q152.5 568.1 168.4 594Q184.4 619.9 211.3 633.6Q238.2 647.3 272.4 647.3Q305.4 647.3 331.5 636.7Q335.1 635.2 338.9 633.4L356.3 585.2L399.9 639.6Q379.7 651.1 354.4 659.7Q314.6 673.3 266.7 673.3Q197.1 673.3 147.9 648.5Q98.6 623.8 73.2 581.1Q47.8 538.4 47.8 483.9Q47.8 429.2 69.5 392.3Q91.3 355.4 125.2 330.5Q153.1 310 182.8 293L301.7 379.4Z";
const ABAJO = "M220.2 -16Q302.4 -16 353.4 10Q404.5 36.1 428.4 81.1Q452.4 126 452.4 181.9Q452.4 238.6 429.9 274.8Q407.5 311 372.8 335.6Q346.1 354.4 317.2 370.8L198.3 284.5L225.3 270.3Q256.2 254.6 282.6 235.9Q308.9 217.3 324.9 193.2Q340.8 169.2 340.8 134.5Q340.8 94.6 323.8 66.9Q306.8 39.2 278.1 24.6Q249.4 10 214.6 10Q189.2 10 167.6 13.7Q145.9 17.5 125 27.7Q123.9 28.2 122.7 28.8L103.5 85.8L55.3 26.6Q88.3 9 124.6 -2.1Q170.1 -16 220.2 -16Z";

const ESCALA = {
  marco: "matrix(0.028436 0 0 -0.028436 8.8893 25.3450)",
  lleno: "matrix(0.031193 0 0 -0.031193 8.2000 26.2509)",
  solo: "matrix(0.042074 0 0 -0.042074 5.4790 29.8268)",
};

export type VarianteSimbolo = keyof typeof ESCALA;

// marco: logo con marco (encabezado, pie) · lleno: ícono con fondo · solo: la «S» sin marco (usos decorativos)
export default function Simbolo({ variante = "marco", className = "" }: { variante?: VarianteSimbolo; className?: string }) {
  return (
    <svg className={`simbolo simbolo-${variante} ${className}`.trim()} viewBox="0 0 32 32" aria-hidden="true">
      {variante === "marco" && <rect className="s-marco" x="1.4" y="1.4" width="29.2" height="29.2" rx="6.6" />}
      {variante === "lleno" && <rect className="s-fondo" width="32" height="32" rx="7.2" />}
      <g transform={ESCALA[variante]}>
        <path className="s-arriba" d={ARRIBA} />
        <path className="s-abajo" d={ABAJO} />
      </g>
    </svg>
  );
}
