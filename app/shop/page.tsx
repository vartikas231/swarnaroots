"use client";

import { ProductCard } from "@/app/components/product-card";
import { useStorefront } from "@/app/components/storefront-provider";
import { useMemo, useState } from "react";

type SortMode = "recommended" | "price-asc" | "price-desc" | "name-asc";

export default function ShopPage() {
  const { state } = useStorefront();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("recommended");

  const maxCatalogPrice = useMemo(() => {
    const prices = state.products.map((product) => product.price);
    return prices.length > 0 ? Math.max(...prices) : 1000;
  }, [state.products]);

  const [maxPrice, setMaxPrice] = useState(maxCatalogPrice);
  const effectiveMaxPrice = Math.min(maxPrice, maxCatalogPrice);
  const effectiveSelectedCategory =
    selectedCategory === "all" || state.categories.includes(selectedCategory)
      ? selectedCategory
      : "all";

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const list = state.products.filter((product) => {
      if (effectiveSelectedCategory !== "all" && product.category !== effectiveSelectedCategory) {
        return false;
      }

      if (inStockOnly && product.stock <= 0) {
        return false;
      }

      if (product.price > effectiveMaxPrice) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.shortDescription.toLowerCase().includes(normalizedSearch) ||
        product.botanicalName.toLowerCase().includes(normalizedSearch)
      );
    });

    if (sortMode === "price-asc") {
      return [...list].sort((a, b) => a.price - b.price);
    }

    if (sortMode === "price-desc") {
      return [...list].sort((a, b) => b.price - a.price);
    }

    if (sortMode === "name-asc") {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [state.products, search, effectiveSelectedCategory, inStockOnly, effectiveMaxPrice, sortMode]);

  const categoryStats = useMemo(() => {
    const categories = state.categories.map((category) => ({
      id: category,
      label: category,
      count: state.products.filter((product) => product.category === category).length,
    }));
    return [
      {
        id: "all",
        label: "All categories",
        count: state.products.length,
      },
      ...categories,
    ];
  }, [state.categories, state.products]);

  return (
    <div className="page-stack">
      <section className="section-card reveal reveal-delay-1">
        <p className="eyebrow">Catalog</p>
        <h1 className="page-title">Shop by category</h1>
        <p className="page-subtitle">
          Explore herbal powders, wellness oils, functional foods, teas, and capsules.
          Use category sidebar and smart filters to find the right products quickly.
        </p>
        <div className="category-badges">
          {categoryStats.filter((item) => item.id !== "all").map((item) => (
            <span key={item.id} className="tag">
              {item.label} ({item.count})
            </span>
          ))}
        </div>
      </section>

      <div className="shop-layout">
        <aside className="section-card shop-sidebar reveal reveal-delay-2">
          <h2>Categories</h2>
          <p>Jump directly to what your customers are looking for.</p>
          <div className="shop-category-list">
            {categoryStats.map((item) => {
              const isActive = effectiveSelectedCategory === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  className={isActive ? "shop-category-btn is-active" : "shop-category-btn"}
                  onClick={() => setSelectedCategory(item.id)}
                >
                  <span>{item.label}</span>
                  <strong>{item.count}</strong>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="shop-main">
          <section className="section-card reveal reveal-delay-2">
            <div className="filters-grid">
              <label>
                Search
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search herbs, oils, foods, or botanical name"
                />
              </label>
              <label>
                Sort by
                <select
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as SortMode)}
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price low to high</option>
                  <option value="price-desc">Price high to low</option>
                  <option value="name-asc">Name A-Z</option>
                </select>
              </label>
              <label className="field-span-2">
                Max price (INR)
                <input
                  type="range"
                  min={100}
                  max={Math.max(100, maxCatalogPrice)}
                  value={effectiveMaxPrice}
                  onChange={(event) => setMaxPrice(Number(event.target.value))}
                />
                <span className="range-value">Up to INR {effectiveMaxPrice}</span>
              </label>
            </div>

            <label className="inline-check">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(event) => setInStockOnly(event.target.checked)}
              />
              Show in-stock products only
            </label>

            <p className="filter-summary">
              {effectiveSelectedCategory === "all" ? "All categories" : effectiveSelectedCategory}: {filteredProducts.length} products found
            </p>
          </section>

          <section className="section-card reveal reveal-delay-2">
            {filteredProducts.length > 0 ? (
              <div className="product-grid">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h1>No matching products</h1>
                <p>Try another category or adjust search and filters.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
