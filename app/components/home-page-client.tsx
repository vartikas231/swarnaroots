"use client";

import { HealthIcon } from "@/app/components/health-icon";
import { ProductCard } from "@/app/components/product-card";
import { useStorefront } from "@/app/components/storefront-provider";
import { siteConfig } from "@/app/config/site";
import Link from "next/link";
import type { CSSProperties } from "react";

export function HomePageClient() {
  const { state } = useStorefront();
  const featuredProducts = state.products.filter((product) => product.featured).slice(0, 4);

  return (
    <div className="page-stack">
      <section className="hero-panel reveal reveal-delay-1">
        <div className="hero-copy">
          <p className="eyebrow">{siteConfig.brand.tagline}</p>
          <h1>{siteConfig.brand.heroTitle}</h1>
          <p>{siteConfig.brand.heroDescription}</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/shop">
              Explore herbal collection
            </Link>
            <Link className="btn btn-outline" href="/checkout">
              Begin checkout
            </Link>
          </div>
          <div className="category-badges" aria-label="Top categories">
            {state.categories.map((category) => (
              <span key={category} className="tag">
                {category}
              </span>
            ))}
          </div>
          <div className="market-ribbon" aria-label="Market highlights">
            <div className="market-ribbon-track">
              <span>
                <HealthIcon name="sprout" size={14} /> Fresh farm lots every week
              </span>
              <span>
                <HealthIcon name="heart-pulse" size={14} /> Trusted by family wellness buyers
              </span>
              <span>
                <HealthIcon name="flask" size={14} /> Small-batch quality checked herbs
              </span>
              <span>
                <HealthIcon name="sun" size={14} /> Natural routines for daily vitality
              </span>
            </div>
          </div>
        </div>

        <div className="hero-metrics">
          {siteConfig.home.highlights.map((item) => (
            <article key={item.label} className="metric-card">
              <p>{item.label}</p>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="section-card reveal reveal-delay-2">
        <div className="section-head">
          <h2>Why customers trust this store</h2>
        </div>
        <div className="trust-grid">
          {siteConfig.home.trustPoints.map((point, index) => (
            <article
              key={point.id}
              className="trust-card reveal-stagger"
              style={{ "--i": index } as CSSProperties}
            >
              <span className="icon-badge" aria-hidden="true">
                <HealthIcon name={point.icon} size={16} />
              </span>
              <h3>{point.title}</h3>
              <p>{point.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-card reveal reveal-delay-2">
        <div className="section-head">
          <h2>Shop by health goals</h2>
          <Link href="/shop">View all products</Link>
        </div>
        <div className="goals-grid">
          {siteConfig.home.healthGoals.map((goal, index) => (
            <article
              key={goal.id}
              className="goal-card reveal-stagger"
              style={{ "--i": index } as CSSProperties}
            >
              <span className="icon-badge icon-badge--goal" aria-hidden="true">
                <HealthIcon name={goal.icon} size={18} />
              </span>
              <h3>{goal.title}</h3>
              <p>{goal.description}</p>
              <Link href="/shop" className="text-link">
                Explore products
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section-card reveal reveal-delay-3">
        <div className="section-head">
          <h2>Signature herbal selections</h2>
          <Link href="/shop">View full catalog</Link>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>

      <section className="section-card reveal reveal-delay-3">
        <div className="section-head">
          <h2>Ingredient quality standards</h2>
        </div>
        <div className="trust-grid">
          {siteConfig.home.ingredientStandards.map((item, index) => (
            <article
              key={item.id}
              className="trust-card reveal-stagger"
              style={{ "--i": index } as CSSProperties}
            >
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-card reveal reveal-delay-3">
        <div className="section-head">
          <h2>Customer satisfaction stories</h2>
          <Link href="/shop">Join our wellness community</Link>
        </div>
        <div className="stories-grid">
          {state.stories.map((story, index) => (
            <article
              key={story.id}
              className="story-card reveal-stagger"
              style={{ "--i": index } as CSSProperties}
            >
              <p>{story.quote}</p>
              <strong>
                {story.name}, {story.city}
              </strong>
              <span>{story.improvement}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
