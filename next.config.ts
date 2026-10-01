import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  // Enlaces antiguos del sitio estático
  async redirects() {
    return [
      { source: "/privacidad.html", destination: "/privacidad", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
