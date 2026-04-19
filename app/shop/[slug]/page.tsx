"use client";

import { AddToCartButton } from "@/app/components/add-to-cart-button";
import { ProductCard } from "@/app/components/product-card";
import { ProductGallery } from "@/app/components/product-gallery";
import { useStorefront } from "@/app/components/storefront-provider";
import { getProductImages } from "@/app/data/herbs";
import { formatPrice } from "@/app/lib/format";
import { toAbsoluteUrl } from "@/app/lib/seo";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { state } = useStorefront();
  const product = state.products.find((item) => item.slug === slug);

  if (!product) {
    return (
      <section className="section-card empty-state reveal reveal-delay-1">
        <h1>Product not found</h1>
        <p>The product may have been removed or updated.</p>
        <Link href="/shop" className="btn btn-primary">
          Back to shop
        </Link>
      </section>
    );
  }

  const relatedProducts = state.products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 3);
  const productImages = getProductImages(product);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    sku: product.id,
    category: product.category,
    image: productImages.length ? productImages : undefined,
    brand: {
      "@type": "Brand",
      name: "Swarna Roots",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: String(product.price),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: toAbsoluteUrl(`/shop/${product.slug}`),
    },
  };

  return (
    <div className="page-stack">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />

      <section className="section-card product-detail reveal reveal-delay-1">
        <ProductGallery key={product.id} product={product} />

        <div className="detail-content">
          <p className="eyebrow">Product details</p>
          <h2>{product.shortDescription}</h2>
          <p>{product.description}</p>

          <div className="price-line detail-price">
            <strong>{formatPrice(product.price)}</strong>
            {product.compareAtPrice ? (
              <span className="compare-price">{formatPrice(product.compareAtPrice)}</span>
            ) : null}
            <span className="unit-pill">{product.unitLabel}</span>
          </div>

          <ul className="plain-list">
            {product.benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>

          <p className="usage-note">
            <strong>How to use:</strong> {product.usage}
          </p>
          <p className="stock-note">{product.stock} units available</p>

          <div className="detail-actions">
            <AddToCartButton
              productId={product.id}
              className="detail-qty-control"
              disabled={product.stock <= 0}
              maxQuantity={product.stock}
            />
            <Link href="/cart" className="btn btn-outline btn-wide">
              Go to cart
            </Link>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="section-card reveal reveal-delay-2">
          <div className="section-head">
            <h2>Related products</h2>
            <Link href="/shop">See all</Link>
          </div>
          <div className="product-grid">
            {relatedProducts.map((item, index) => (
              <ProductCard key={item.id} product={item} index={index} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
