"use client";

import { AddToCartButton } from "@/app/components/add-to-cart-button";
import type { HerbProduct } from "@/app/data/herbs";
import { formatPrice } from "@/app/lib/format";
import type { CSSProperties } from "react";
import Link from "next/link";

interface ProductCardProps {
  product: HerbProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const thumbStyle = product.imageUrl
    ? ({
        "--thumb-image": `url(${product.imageUrl})`,
      } as CSSProperties)
    : undefined;

  return (
    <article
      className="product-card reveal-stagger"
      style={{ "--i": index } as CSSProperties}
    >
      <Link
        href={`/shop/${product.slug}`}
        className={`product-thumb ${product.toneClass} ${product.imageUrl ? "product-thumb--photo" : ""}`}
        style={thumbStyle}
      >
        <span className="product-category">{product.category}</span>
        <strong>{product.name}</strong>
        <small>{product.botanicalName}</small>
      </Link>

      <div className="product-body">
        <p className="product-description">{product.shortDescription}</p>

        <div className="price-line">
          <div className="price-main">
            <strong>{formatPrice(product.price)}</strong>
            {product.compareAtPrice ? (
              <span className="compare-price">{formatPrice(product.compareAtPrice)}</span>
            ) : null}
          </div>
          <span className="unit-pill">{product.unitLabel}</span>
        </div>

        <div className="product-actions">
          <Link href={`/shop/${product.slug}`} className="btn btn-outline btn-sm">
            View
          </Link>
          <AddToCartButton
            productId={product.id}
            label="Add"
            className="product-qty-control"
            compact
            disabled={product.stock <= 0}
            maxQuantity={product.stock}
          />
        </div>
      </div>
    </article>
  );
}
