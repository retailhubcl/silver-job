import type { MetadataRoute } from "next";
import { urlSitio } from "@/lib/mercadopago";

// Solo páginas públicas e indexables (/privacidad, /pagar y /pago son noindex)
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${urlSitio()}/`, changeFrequency: "monthly", priority: 1 }];
}
