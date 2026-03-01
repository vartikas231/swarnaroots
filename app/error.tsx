"use client";

import Link from "next/link";
import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="section-card empty-state reveal reveal-delay-1">
      <p className="eyebrow">Something went wrong</p>
      <h1>We could not load this page</h1>
      <p>Please try again. If this continues, return to the storefront and retry.</p>
      <div className="hero-actions">
        <button type="button" className="btn btn-primary" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="btn btn-outline">
          Back home
        </Link>
      </div>
    </section>
  );
}
