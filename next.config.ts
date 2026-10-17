import type { NextConfig } from "next";

// Cabeceras de seguridad. La CSP solo se aplica en producción (el modo desarrollo de Next
// necesita eval). 'unsafe-inline' en scripts es necesario para la hidratación de Next sin
// nonces; pasar a nonces (proxy.ts) queda como mejora (ver docs/seguridad.md).
const mercadoPago = "https://*.mercadopago.com https://*.mercadopago.cl https://*.mercadolibre.com";
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self' ${mercadoPago}`,
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const cabeceras = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: csp }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [
      { source: "/:path*", headers: cabeceras },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
  // Enlaces antiguos del sitio estático
  async redirects() {
    return [
      { source: "/privacidad.html", destination: "/privacidad", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
