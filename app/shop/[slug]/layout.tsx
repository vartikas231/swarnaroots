import type { Metadata } from "next";
import { getProductImages, herbCatalog } from "@/app/data/herbs";
import { toAbsoluteUrl } from "@/app/lib/seo";

interface ProductLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const product = herbCatalog.find((item) => item.slug === slug);

  if (!product) {
    return {
      title: "Product",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const primaryImage = getProductImages(product)[0];

  return {
    title: product.name,
    description: product.shortDescription,
    keywords: [
      product.name,
      product.category,
      "ayurvedic product",
      "natural wellness",
    ],
    alternates: {
      canonical: `/shop/${product.slug}`,
      languages: {
        "en-IN": `/shop/${product.slug}`,
        "en-US": `/shop/${product.slug}`,
        "x-default": `/shop/${product.slug}`,
      },
    },
    openGraph: {
      type: "website",
      url: toAbsoluteUrl(`/shop/${product.slug}`),
      title: product.name,
      description: product.shortDescription,
      images: primaryImage ? [{ url: primaryImage }] : undefined,
    },
  };
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return children;
}
