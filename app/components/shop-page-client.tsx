"use client";

import { ProductCard } from "@/app/components/product-card";
import { useStorefront } from "@/app/components/storefront-provider";
import { getCategoryPathByName } from "@/app/lib/category-seo";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type SortMode = "recommended" | "price-asc" | "price-desc" | "name-asc";

export function ShopPageClient() {
  const { state } = useStorefront();
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("recommended");
  const [productsPerPage, setProductsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [suggestionMode, setSuggestionMode] = useState<
    "daily" | "immunity" | "digestion" | "stress"
  >("daily");
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * productsPerPage;
    return filteredProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredProducts, productsPerPage, safeCurrentPage]);

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

  const suggestionProducts = useMemo(() => {
    const byMode = state.products.filter((product) => {
      const searchable = `${product.name} ${product.shortDescription} ${product.description} ${product.category}`.toLowerCase();
      if (suggestionMode === "immunity") {
        return /immunity|tulsi|turmeric|amla|moringa/.test(searchable);
      }
      if (suggestionMode === "digestion") {
        return /digest|triphala|ginger|mint|ajwain|fennel|neem/.test(searchable);
      }
      if (suggestionMode === "stress") {
        return /stress|calm|sleep|ashwagandha|brahmi|relax/.test(searchable);
      }

      return (
        product.featured ||
        ["Functional Foods", "Herbal Powders", "Spices"].includes(product.category)
      );
    });

    return byMode.slice(0, 4);
  }, [state.products, suggestionMode]);

  const pageOptions = [10, 25, 50, 100];

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  return (
    <div className="page-stack">
      <section className="section-card reveal reveal-delay-2">
        <div className="section-head">
          <h2>Suggested products</h2>
        </div>
        <p className="page-subtitle">
          Not sure what to buy? Start with a goal and we will suggest a few products.
        </p>

        <div className="suggestion-tabs">
          <button
            type="button"
            className={suggestionMode === "daily" ? "suggestion-tab is-active" : "suggestion-tab"}
            onClick={() => setSuggestionMode("daily")}
          >
            Daily wellness
          </button>
          <button
            type="button"
            className={suggestionMode === "immunity" ? "suggestion-tab is-active" : "suggestion-tab"}
            onClick={() => setSuggestionMode("immunity")}
          >
            Immunity
          </button>
          <button
            type="button"
            className={suggestionMode === "digestion" ? "suggestion-tab is-active" : "suggestion-tab"}
            onClick={() => setSuggestionMode("digestion")}
          >
            Digestion
          </button>
          <button
            type="button"
            className={suggestionMode === "stress" ? "suggestion-tab is-active" : "suggestion-tab"}
            onClick={() => setSuggestionMode("stress")}
          >
            Stress relief
          </button>
        </div>

        {suggestionProducts.length > 0 ? (
          <div className="product-grid">
            {suggestionProducts.map((product, index) => (
              <ProductCard key={`suggested-${product.id}`} product={product} index={index} />
            ))}
          </div>
        ) : (
          <p className="filter-summary">No products matched this goal yet.</p>
        )}
      </section>

      <div className="shop-layout">
        <aside className="section-card shop-sidebar reveal reveal-delay-2">
          <h2>Categories</h2>
          <p>Jump directly to what your customers are looking for.</p>
          <div className="shop-category-list">
            {categoryStats.map((item) => {
              const isActive = effectiveSelectedCategory === item.id;
              const categoryPath = item.id === "all" ? null : getCategoryPathByName(item.label);

              return (
                <div key={item.id} className="shop-category-item">
                  <button
                    type="button"
                    className={isActive ? "shop-category-btn is-active" : "shop-category-btn"}
                    onClick={() => {
                      setSelectedCategory(item.id);
                      setCurrentPage(1);
                    }}
                  >
                    <span>{item.label}</span>
                    <strong>{item.count}</strong>
                  </button>

                  {isAdmin && categoryPath ? (
                    <Link href={categoryPath} className="shop-category-link">
                      Open SEO page
                    </Link>
                  ) : null}
                </div>
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
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search herbs, oils, foods, tea, candles, or botanical name"
                />
              </label>
              <label>
                Sort by
                <select
                  value={sortMode}
                  onChange={(event) => {
                    setSortMode(event.target.value as SortMode);
                    setCurrentPage(1);
                  }}
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price low to high</option>
                  <option value="price-desc">Price high to low</option>
                  <option value="name-asc">Name A-Z</option>
                </select>
              </label>
              <label>
                Products per page
                <select
                  value={productsPerPage}
                  onChange={(event) => {
                    setProductsPerPage(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {pageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option} products
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-span-2">
                Max price (INR)
                <input
                  type="range"
                  min={100}
                  max={Math.max(100, maxCatalogPrice)}
                  value={effectiveMaxPrice}
                  onChange={(event) => {
                    setMaxPrice(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                />
                <span className="range-value">Up to INR {effectiveMaxPrice}</span>
              </label>
            </div>

            <label className="inline-check">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(event) => {
                  setInStockOnly(event.target.checked);
                  setCurrentPage(1);
                }}
              />
              Show in-stock products only
            </label>

            <p className="filter-summary">
              {effectiveSelectedCategory === "all" ? "All categories" : effectiveSelectedCategory}:{" "}
              {filteredProducts.length} products found
            </p>
          </section>

          <section className="section-card reveal reveal-delay-2">
            {filteredProducts.length > 0 ? (
              <>
                <div className="shop-results-meta">
                  <p>
                    Showing {(safeCurrentPage - 1) * productsPerPage + 1}
                    {" - "}
                    {Math.min(safeCurrentPage * productsPerPage, filteredProducts.length)}
                    {" of "}
                    {filteredProducts.length}
                  </p>
                  <p>
                    Page {safeCurrentPage} of {totalPages}
                  </p>
                </div>
                <div className="product-grid">
                {paginatedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
                </div>
                {totalPages > 1 ? (
                  <div className="shop-pagination" aria-label="Products pagination">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={safeCurrentPage === 1}
                      onClick={() => goToPage(safeCurrentPage - 1)}
                    >
                      Previous
                    </button>
                    <div className="shop-pagination-pages">
                      {Array.from({ length: totalPages }, (_, index) => index + 1)
                        .slice(
                          Math.max(0, safeCurrentPage - 3),
                          Math.max(0, safeCurrentPage - 3) + 5,
                        )
                        .map((page) => (
                          <button
                            key={page}
                            type="button"
                            className={page === safeCurrentPage ? "shop-page-btn is-active" : "shop-page-btn"}
                            onClick={() => goToPage(page)}
                          >
                            {page}
                          </button>
                        ))}
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={safeCurrentPage === totalPages}
                      onClick={() => goToPage(safeCurrentPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </>
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
