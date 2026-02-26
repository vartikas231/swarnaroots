"use client";

import { useCart } from "@/app/components/cart-provider";

interface AddToCartButtonProps {
  productId: string;
  label?: string;
  quantity?: number;
  className?: string;
  disabled?: boolean;
  maxQuantity?: number;
  compact?: boolean;
}

export function AddToCartButton({
  productId,
  label = "Add to cart",
  quantity = 1,
  className,
  disabled = false,
  maxQuantity = 99,
  compact = false,
}: AddToCartButtonProps) {
  const { addItem, setQuantity, getQuantity } = useCart();
  const currentQuantity = getQuantity(productId);
  const nextMax = Math.max(1, Math.min(maxQuantity, 99));

  if (disabled || maxQuantity <= 0) {
    return (
      <button
        type="button"
        disabled
        className={`btn btn-primary ${className ?? ""}`}
      >
        Out of stock
      </button>
    );
  }

  if (currentQuantity <= 0) {
    return (
      <button
        type="button"
        onClick={() => addItem(productId, quantity)}
        className={`btn btn-primary ${className ?? ""}`}
      >
        {label}
      </button>
    );
  }

  return (
    <div className={`qty-control ${compact ? "qty-control--compact" : ""} ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setQuantity(productId, currentQuantity - 1)}
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span>{currentQuantity}</span>
      <button
        type="button"
        onClick={() => addItem(productId, 1)}
        disabled={currentQuantity >= nextMax}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
