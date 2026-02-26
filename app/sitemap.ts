import type { MetadataRoute } from "next";
import { herbCatalog } from "@/app/data/herbs";
import { toAbsoluteUrl } from "@/app/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: toAbsoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: toAbsoluteUrl("/shop"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const productEntries: MetadataRoute.Sitemap = herbCatalog.map((product) => ({
    url: toAbsoluteUrl(`/shop/${product.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [...staticEntries, ...productEntries];
}
