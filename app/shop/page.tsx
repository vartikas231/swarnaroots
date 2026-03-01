import { ShopPageClient } from "@/app/components/shop-page-client";
import { herbCatalog } from "@/app/data/herbs";
import { getAllCategoryProfiles } from "@/app/lib/category-seo";
import { toAbsoluteUrl } from "@/app/lib/seo";

export default function ShopPage() {
  const categoryProfiles = getAllCategoryProfiles();
  const indexedCategories = categoryProfiles.filter((profile) => profile.indexable);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Shop Herbal Products",
    url: toAbsoluteUrl("/shop"),
    description:
      "Browse Swarna Roots categories including herbal powders, oils, functional foods, teas, capsules, and wellness candles.",
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Swarna Roots Product Catalog",
    itemListElement: herbCatalog.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: toAbsoluteUrl(`/shop/${product.slug}`),
      name: product.name,
    })),
  };

  const categoryListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Swarna Roots Shop Categories",
    itemListElement: indexedCategories.map((category, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: toAbsoluteUrl(`/shop/category/${category.slug}`),
      name: category.name,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([collectionJsonLd, itemListJsonLd, categoryListJsonLd]),
        }}
      />
      <ShopPageClient />
    </>
  );
}
