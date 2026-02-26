import type { Metadata } from "next";
import { herbCatalog } from "@/app/data/herbs";
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

  return {
    title: product.name,
    description: product.shortDescription,
    alternates: {
      canonical: `/shop/${product.slug}`,
    },
    openGraph: {
      type: "website",
      url: toAbsoluteUrl(`/shop/${product.slug}`),
      title: product.name,
      description: product.shortDescription,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
  };
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return children;
}
