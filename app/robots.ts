import type { MetadataRoute } from "next";
import { getSiteUrl, toAbsoluteUrl } from "@/app/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/cart", "/checkout"],
      },
    ],
    sitemap: toAbsoluteUrl("/sitemap.xml"),
    host: new URL(getSiteUrl()).host,
  };
}
