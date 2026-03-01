import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section-card empty-state reveal reveal-delay-1">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>
        This page may have moved, or the link is incorrect. Explore the storefront from
        the main catalog.
      </p>
      <div className="hero-actions">
        <Link href="/shop" className="btn btn-primary">
          Browse products
        </Link>
        <Link href="/" className="btn btn-outline">
          Back home
        </Link>
      </div>
    </section>
  );
}
