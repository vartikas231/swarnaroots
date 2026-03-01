"use client";

import Link from "next/link";
import "./globals.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  console.error(error);

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="app-shell">
          <main className="page-shell">
            <section className="section-card empty-state">
              <p className="eyebrow">System error</p>
              <h1>We hit an unexpected issue</h1>
              <p>
                The page failed to load globally. Retry once, or return to the storefront.
              </p>
              <div className="hero-actions">
                <button type="button" className="btn btn-primary" onClick={reset}>
                  Try again
                </button>
                <Link href="/" className="btn btn-outline">
                  Back home
                </Link>
              </div>
            </section>
          </main>
        </div>
      </body>
    </html>
  );
}
