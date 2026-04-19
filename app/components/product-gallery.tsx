"use client";

import { getProductImages, type HerbProduct } from "@/app/data/herbs";
import { useMemo, useState, type CSSProperties } from "react";

interface ProductGalleryProps {
  product: HerbProduct;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const images = useMemo(() => getProductImages(product), [product]);
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className={`detail-visual ${product.toneClass}`}>
        <span className="tag">{product.category}</span>
        <h1>{product.name}</h1>
        <p>{product.botanicalName}</p>
      </div>
    );
  }

  const currentImage = images[Math.min(activeIndex, images.length - 1)];
  const detailVisualStyle = {
    "--detail-image": `url(${currentImage})`,
  } as CSSProperties;

  const showControls = images.length > 1;

  return (
    <div className="product-gallery">
      <div
        className={`detail-visual detail-visual--photo product-gallery-main ${product.toneClass}`}
        style={detailVisualStyle}
      >
        <div className="product-gallery-top">
          <span className="tag">{product.category}</span>
          {showControls ? (
            <span className="product-gallery-counter">
              {activeIndex + 1} / {images.length}
            </span>
          ) : null}
        </div>
        <h1>{product.name}</h1>
        <p>{product.botanicalName}</p>

        {showControls ? (
          <div className="product-gallery-nav">
            <button
              type="button"
              className="product-gallery-nav-btn"
              onClick={() =>
                setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
              }
              aria-label={`Show previous image of ${product.name}`}
            >
              Prev
            </button>
            <button
              type="button"
              className="product-gallery-nav-btn"
              onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
              aria-label={`Show next image of ${product.name}`}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>

      {showControls ? (
        <div className="product-gallery-thumbs" aria-label={`${product.name} image gallery`}>
          {images.map((image, index) => (
            <button
              key={`${product.id}-${index + 1}`}
              type="button"
              className={
                index === activeIndex
                  ? "product-gallery-thumb is-active"
                  : "product-gallery-thumb"
              }
              style={
                {
                  "--gallery-thumb-image": `url(${image})`,
                } as CSSProperties
              }
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1} of ${product.name}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
