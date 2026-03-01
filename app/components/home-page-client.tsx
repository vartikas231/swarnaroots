"use client";

import { HealthIcon } from "@/app/components/health-icon";
import { ProductCard } from "@/app/components/product-card";
import { useStorefront } from "@/app/components/storefront-provider";
import { siteConfig } from "@/app/config/site";
import { getCategoryPathByName } from "@/app/lib/category-seo";
import Link from "next/link";
import { useMemo, type CSSProperties } from "react";

export function HomePageClient() {
  const { state } = useStorefront();
  const featuredProducts = state.products.filter((product) => product.featured).slice(0, 4);
  const categoryQuickLinks = useMemo(() => {
    return state.categories
      .map((category) => ({
        name: category,
        count: state.products.filter((product) => product.category === category).length,
        href: getCategoryPathByName(category) ?? "/shop",
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [state.categories, state.products]);
  const marketplaceLinks = useMemo(() => {
    const links = [
      {
        label: "Shop on Amazon",
        href: state.marketplaces.amazonUrl,
      },
      {
        label: "Shop on Flipkart",
        href: state.marketplaces.flipkartUrl,
      },
    ];
    return links.filter((item) => /^https?:\/\//i.test(item.href));
  }, [state.marketplaces.amazonUrl, state.marketplaces.flipkartUrl]);

  return (
    <div className="page-stack">
      <div className="home-market-layout">
        <aside className="section-card home-category-sidebar reveal reveal-delay-1">
          <p className="eyebrow">Categories</p>
          <h2>Shop by section</h2>
          <p>Quickly open teas, candles, spices, oils, powders, and more.</p>

          <nav className="home-category-list" aria-label="Homepage category shortcuts">
            {categoryQuickLinks.map((item) => (
              <Link key={item.name} href={item.href} className="home-category-link">
                <span>{item.name}</span>
                <strong>{item.count}</strong>
              </Link>
            ))}
          </nav>
        </aside>

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
            {marketplaceLinks.length > 0 ? (
              <div className="marketplace-actions">
                {marketplaceLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ) : null}
            <div className="category-badges" aria-label="Top categories">
              {categoryQuickLinks.map((category) => (
                <Link key={category.name} href={category.href} className="tag tag-link">
                  {category.name}
                </Link>
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
      </div>

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

      <section className="section-card reveal reveal-delay-3">
        <div className="section-head">
          <h2>Our family team</h2>
        </div>
        <p className="page-subtitle">
          We run Swarna Roots side by side with our day-to-day work, guided by one shared
          family passion: helping people build healthier routines through herbs.
        </p>
        <div className="team-grid">
          {siteConfig.home.team.map((member, index) => (
            <article
              key={member.name}
              className="team-card reveal-stagger"
              style={{ "--i": index } as CSSProperties}
            >
              <h3>{member.name}</h3>
              <p className="team-title">{member.title}</p>
              <p>{member.summary}</p>
              <div className="category-badges">
                {member.focus.map((item) => (
                  <span key={item} className="tag">
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
