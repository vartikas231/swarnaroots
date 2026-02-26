"use client";

import { AddToCartButton } from "@/app/components/add-to-cart-button";
import { ProductCard } from "@/app/components/product-card";
import { useStorefront } from "@/app/components/storefront-provider";
import { formatPrice } from "@/app/lib/format";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { CSSProperties } from "react";

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
  const detailVisualStyle = product.imageUrl
    ? ({
        "--detail-image": `url(${product.imageUrl})`,
      } as CSSProperties)
    : undefined;

  return (
    <div className="page-stack">
      <section className="section-card product-detail reveal reveal-delay-1">
        <div
          className={`detail-visual ${product.toneClass} ${product.imageUrl ? "detail-visual--photo" : ""}`}
          style={detailVisualStyle}
        >
          <span className="tag">{product.category}</span>
          <h1>{product.name}</h1>
          <p>{product.botanicalName}</p>
        </div>

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
            <h2>Related herbs</h2>
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
