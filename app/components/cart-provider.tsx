"use client";

import { useStorefront } from "@/app/components/storefront-provider";
import type { HerbProduct } from "@/app/data/herbs";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type CartState = Record<string, number>;

interface LineItem {
  productId: string;
  quantity: number;
  lineTotal: number;
  product: HerbProduct;
}

interface CartContextValue {
  lineItems: LineItem[];
  cartCount: number;
  subtotal: number;
  addItem: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getQuantity: (productId: string) => number;
}

const STORAGE_KEY = "swarna-roots-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

function getInitialCartState(products: HerbProduct[]): CartState {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return {};
    }

    const parsed = JSON.parse(rawValue) as CartState;
    const nextState: CartState = {};

    for (const [productId, quantity] of Object.entries(parsed)) {
      const product = products.find((item) => item.id === productId);
      if (product && Number.isFinite(quantity) && quantity > 0) {
        nextState[productId] = Math.min(Math.floor(quantity), 99);
      }
    }

    return nextState;
  } catch {
    return {};
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { state } = useStorefront();
  const products = state.products;
  const [cartState, setCartState] = useState<CartState>({});
  const [hasHydratedCart, setHasHydratedCart] = useState(false);

  useEffect(() => {
    setCartState(getInitialCartState(products));
    setHasHydratedCart(true);
    // Intentionally run once on mount to avoid SSR/client hydration mismatch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasHydratedCart) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartState));
  }, [cartState, hasHydratedCart]);

  const addItem = useCallback((productId: string, quantity = 1) => {
    const product = products.find((item) => item.id === productId);
    if (!product || quantity <= 0) {
      return;
    }

    setCartState((prev) => {
      const current = prev[productId] ?? 0;
      const nextQuantity = Math.min(current + Math.floor(quantity), 99);
      return { ...prev, [productId]: nextQuantity };
    });
  }, [products]);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setCartState((prev) => {
      if (!prev[productId]) {
        return prev;
      }

      if (quantity <= 0) {
        const nextState = { ...prev };
        delete nextState[productId];
        return nextState;
      }

      return { ...prev, [productId]: Math.min(Math.floor(quantity), 99) };
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCartState((prev) => {
      if (!prev[productId]) {
        return prev;
      }

      const nextState = { ...prev };
      delete nextState[productId];
      return nextState;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartState({});
  }, []);

  const getQuantity = useCallback(
    (productId: string) => {
      return cartState[productId] ?? 0;
    },
    [cartState],
  );

  const lineItems = useMemo(() => {
    return Object.entries(cartState)
      .map(([productId, quantity]) => {
        const product = products.find((item) => item.id === productId);
        if (!product || quantity <= 0) {
          return null;
        }

        return {
          productId,
          quantity,
          product,
          lineTotal: product.price * quantity,
        };
      })
      .filter((item): item is LineItem => item !== null);
  }, [cartState, products]);

  const cartCount = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [lineItems]);

  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  }, [lineItems]);

  const value = useMemo<CartContextValue>(
    () => ({
      lineItems,
      cartCount,
      subtotal,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      getQuantity,
    }),
    [lineItems, cartCount, subtotal, addItem, setQuantity, removeItem, clearCart, getQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
