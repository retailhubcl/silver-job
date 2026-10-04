import type { MetadataRoute } from "next";
import { urlSitio } from "@/lib/mercadopago";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/pagar", "/pago/", "/admin/"] },
    sitemap: `${urlSitio()}/sitemap.xml`,
  };
}
