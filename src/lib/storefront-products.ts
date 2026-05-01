import { herbCatalog, type HerbProduct } from "@/app/data/herbs";
import {
  mergeStorefrontProductOverrides,
  type StorefrontProductOverride,
} from "@/app/lib/storefront-products";
import { db } from "@/src/lib/db";

function slugifyCategory(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getStorefrontProductOverrides(): Promise<StorefrontProductOverride[]> {
  const products = await db.product.findMany({
    select: {
      slug: true,
      images: true,
    },
  });

  return products.map((product) => ({
    slug: product.slug,
    images: product.images,
  }));
}

export async function getMergedStorefrontProducts(): Promise<HerbProduct[]> {
  const overrides = await getStorefrontProductOverrides();
  return mergeStorefrontProductOverrides(herbCatalog, overrides);
}

export async function upsertStorefrontProductImages(product: HerbProduct, images: string[]) {
  const categorySlug = slugifyCategory(product.category);

  const category = await db.category.upsert({
    where: { slug: categorySlug },
    update: {
      name: product.category,
      isActive: true,
    },
    create: {
      name: product.category,
      slug: categorySlug,
      description: `${product.category} collection`,
      isActive: true,
    },
    select: { id: true },
  });

  return db.product.upsert({
    where: { slug: product.slug },
    update: {
      name: product.name,
      shortDesc: product.shortDescription,
      description: product.description,
      categoryId: category.id,
      basePrice: product.price,
      comparePrice: product.compareAtPrice ?? null,
      images,
      isFeatured: product.featured,
      isActive: true,
      tags: [product.category, product.botanicalName].filter(Boolean),
      seoKeywords: [product.name, product.category],
      trackInventory: false,
    },
    create: {
      name: product.name,
      slug: product.slug,
      shortDesc: product.shortDescription,
      description: product.description,
      categoryId: category.id,
      basePrice: product.price,
      comparePrice: product.compareAtPrice ?? null,
      images,
      isFeatured: product.featured,
      isActive: true,
      tags: [product.category, product.botanicalName].filter(Boolean),
      seoKeywords: [product.name, product.category],
      trackInventory: false,
    },
    select: {
      slug: true,
      images: true,
    },
  });
}
