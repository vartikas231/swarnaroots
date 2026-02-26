"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  const [loadingBootstrapState, setLoadingBootstrapState] = useState(true);
  const [needsBootstrap, setNeedsBootstrap] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bootstrapName, setBootstrapName] = useState("");
  const [bootstrapEmail, setBootstrapEmail] = useState("");
  const [bootstrapPassword, setBootstrapPassword] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadState() {
      try {
        const response = await fetch("/api/auth/bootstrap-admin", {
          cache: "no-store",
        });
        const payload = (await response.json()) as { needsBootstrap?: boolean };
        if (!cancelled) {
          setNeedsBootstrap(Boolean(payload.needsBootstrap));
        }
      } catch {
        if (!cancelled) {
          setError("Unable to check admin setup status.");
        }
      } finally {
        if (!cancelled) {
          setLoadingBootstrapState(false);
        }
      }
    }

    loadState();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setError("Invalid admin credentials.");
      return;
    }

    router.push(result.url ?? callbackUrl);
    router.refresh();
  };

  const handleBootstrap = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const response = await fetch("/api/auth/bootstrap-admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: bootstrapName,
        email: bootstrapEmail,
        password: bootstrapPassword,
      }),
    });

    const payload = (await response.json()) as {
      error?: string;
      message?: string;
    };

    if (!response.ok) {
      setIsSubmitting(false);
      setError(payload.error ?? "Failed to create first admin.");
      return;
    }

    setSuccess(payload.message ?? "Super admin created. Signing you in...");
    setNeedsBootstrap(false);
    setEmail(bootstrapEmail);
    setPassword(bootstrapPassword);

    const signInResult = await signIn("credentials", {
      email: bootstrapEmail,
      password: bootstrapPassword,
      redirect: false,
      callbackUrl: "/admin",
    });

    setIsSubmitting(false);

    if (!signInResult || signInResult.error) {
      setError("Admin created, but auto-login failed. Please sign in manually.");
      return;
    }

    router.push(signInResult.url ?? "/admin");
    router.refresh();
  };

  return (
    <div className="page-stack">
      <section className="section-card reveal reveal-delay-1">
        <p className="eyebrow">Admin access</p>
        <h1 className="page-title">
          {needsBootstrap ? "Create first admin account" : "Admin sign in"}
        </h1>
        <p className="page-subtitle">
          {needsBootstrap
            ? "Set up the first super admin. After this, create other family admin users from the admin portal."
            : "Use admin credentials to manage products, categories, theme, stories, and payment records."}
        </p>
      </section>

      <section className="section-card admin-section reveal reveal-delay-2">
        {loadingBootstrapState ? (
          <p>Checking setup status...</p>
        ) : needsBootstrap ? (
          <form className="admin-grid-form" onSubmit={handleBootstrap}>
            <label>
              Full name
              <input
                required
                value={bootstrapName}
                onChange={(event) => setBootstrapName(event.target.value)}
                placeholder="Owner name"
              />
            </label>
            <label>
              Admin email
              <input
                required
                type="email"
                value={bootstrapEmail}
                onChange={(event) => setBootstrapEmail(event.target.value)}
                placeholder="owner@yourdomain.com"
              />
            </label>
            <label className="field-span-2">
              Password (min 8 chars)
              <input
                required
                type="password"
                minLength={8}
                value={bootstrapPassword}
                onChange={(event) => setBootstrapPassword(event.target.value)}
                placeholder="Create a strong password"
              />
            </label>
            <button type="submit" className="btn btn-primary field-span-2" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create super admin"}
            </button>
          </form>
        ) : (
          <form className="admin-grid-form" onSubmit={handleLogin}>
            <label className="field-span-2">
              Admin email
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@yourdomain.com"
              />
            </label>
            <label className="field-span-2">
              Password
              <input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your admin password"
              />
            </label>
            <button type="submit" className="btn btn-primary field-span-2" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}

        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="form-success">{success}</p> : null}

        <p className="auth-note">
          Storefront still remains public for customers. Only `/admin` is protected.
        </p>
        <Link href="/" className="text-link">
          Back to storefront
        </Link>
      </section>
    </div>
  );
}
