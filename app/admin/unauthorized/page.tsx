import Link from "next/link";

export default function AdminUnauthorizedPage() {
  return (
    <section className="section-card empty-state reveal reveal-delay-1">
      <p className="eyebrow">Access denied</p>
      <h1>Admin access required</h1>
      <p>
        Your account does not have permission for this page. Sign in with an admin account.
      </p>
      <div className="hero-actions">
        <Link href="/admin/login" className="btn btn-primary">
          Admin login
        </Link>
        <Link href="/" className="btn btn-outline">
          Back to store
        </Link>
      </div>
    </section>
  );
}
