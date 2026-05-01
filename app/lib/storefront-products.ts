import type { HerbProduct } from "@/app/data/herbs";

export interface StorefrontProductOverride {
  slug: string;
  images: string[];
}

function normalizeImages(images: string[]) {
  const seen = new Set<string>();
  return images
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => {
      if (seen.has(item)) {
        return false;
      }
      seen.add(item);
      return true;
    })
    .slice(0, 5);
}

export function mergeStorefrontProductOverrides(
  products: HerbProduct[],
  overrides: StorefrontProductOverride[],
) {
  if (!overrides.length) {
    return products;
  }

  const overrideMap = new Map(
    overrides.map((override) => [override.slug, normalizeImages(override.images)]),
  );

  return products.map((product) => {
    const overrideImages = overrideMap.get(product.slug);
    if (!overrideImages || overrideImages.length === 0) {
      return product;
    }

    return {
      ...product,
      imageUrl: overrideImages[0],
      images: overrideImages,
    };
  });
}
