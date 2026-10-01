import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const SITIO = process.env.NEXT_PUBLIC_SITE_URL ?? "https://silverjob.cl";

export const metadata: Metadata = {
  metadataBase: new URL(SITIO),
  title: "Silver Job: la experiencia no se jubila",
  description: "Gerentes senior que ya hicieron crecer empresas, ahora por horas para pymes que quieren llegar más lejos.",
  icons: { icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%2316202A'/%3E%3Cg transform='rotate%28-90 16 16%29' fill='none' stroke-width='5'%3E%3Ccircle cx='16' cy='16' r='10' stroke='%23A3324F' stroke-dasharray='17.6 45.2'/%3E%3Ccircle cx='16' cy='16' r='10' stroke='%23D9A33A' stroke-dasharray='17.6 45.2' stroke-dashoffset='-20.94'/%3E%3Ccircle cx='16' cy='16' r='10' stroke='%233D6FD1' stroke-dasharray='17.6 45.2' stroke-dashoffset='-41.89'/%3E%3C/g%3E%3Ccircle cx='16' cy='16' r='3.4' fill='%23EDEFF1'/%3E%3C/svg%3E" },
  openGraph: {
    title: "Silver Job: la experiencia no se jubila",
    description: "Gerentes senior por horas para pymes que quieren llegar más lejos.",
    type: "website",
    url: "/",
    images: [{ url: "/img/og.jpg", width: 1200, height: 630, alt: "Silver Job: la experiencia no se jubila" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400..700&family=Source+Sans+3:wght@400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
