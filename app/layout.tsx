import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const SITIO = process.env.NEXT_PUBLIC_SITE_URL ?? "https://silverjob.cl";

// Fuentes servidas desde el propio sitio (subconjunto latino, licencia OFL en app/fuentes)
const sourceSans = localFont({
  src: "./fuentes/source-sans-3-latin-wght-normal.woff2",
  weight: "200 900",
  variable: "--fuente-sans",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});
const sourceSerif = localFont({
  src: "./fuentes/source-serif-4-latin-opsz-normal.woff2",
  weight: "200 900",
  variable: "--fuente-serif",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITIO),
  title: "Silver Job: la experiencia no se jubila",
  description: "Gerentes senior que ya hicieron crecer empresas, ahora por horas para pymes que quieren llegar más lejos.",
  openGraph: {
    title: "Silver Job: la experiencia no se jubila",
    description: "Gerentes senior por horas para pymes que quieren llegar más lejos.",
    type: "website",
    url: "/",
    locale: "es_CL",
    siteName: "Silver Job",
    images: [{ url: "/img/og.jpg", width: 1200, height: 630, alt: "Silver Job: la experiencia no se jubila" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#16202A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={`${sourceSans.variable} ${sourceSerif.variable}`}>
      <body>
        <a className="saltar" href="#contenido">Saltar al contenido</a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
