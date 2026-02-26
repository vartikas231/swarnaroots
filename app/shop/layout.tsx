import type { Metadata } from "next";
import { siteConfig } from "@/app/config/site";
import { toAbsoluteUrl } from "@/app/lib/seo";

export const metadata: Metadata = {
  title: "Shop Herbal Products",
  description:
    "Browse premium Ayurvedic herbs, oils, and functional foods from Swarna Roots.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    type: "website",
    url: toAbsoluteUrl("/shop"),
    title: `Shop Herbal Products | ${siteConfig.brand.name}`,
    description:
      "Browse premium Ayurvedic herbs, oils, and functional foods from Swarna Roots.",
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
