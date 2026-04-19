"use client";

import { siteConfig } from "@/app/config/site";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type ShipmentStatus =
  | "NOT_BOOKED"
  | "BOOKED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED_ATTEMPT"
  | "RTO_INITIATED"
  | "RTO_DELIVERED"
  | "CANCELLED";

interface TrackOrderEvent {
  status: ShipmentStatus;
  title: string;
  description: string | null;
  location: string | null;
  eventAt: string;
}

interface TrackOrderResult {
  orderNumber: string;
  customerName: string;
  email: string;
  total: number;
  createdAt: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  shipmentStatus: ShipmentStatus;
  shippingProvider: string | null;
  shippingServiceName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shipmentUpdatedAt: string | null;
  deliveredAt: string | null;
  shipmentEvents: TrackOrderEvent[];
}

function toShipmentStatusLabel(status: ShipmentStatus) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusTone(status: ShipmentStatus) {
  switch (status) {
    case "DELIVERED":
      return "is-delivered";
    case "OUT_FOR_DELIVERY":
      return "is-active";
    case "FAILED_ATTEMPT":
    case "RTO_INITIATED":
    case "RTO_DELIVERED":
    case "CANCELLED":
      return "is-alert";
    default:
      return "is-pending";
  }
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const initialOrderNumber = useMemo(
    () => searchParams.get("orderNumber")?.trim() ?? "",
    [searchParams],
  );
  const initialEmail = useMemo(
    () => searchParams.get("email")?.trim() ?? "",
    [searchParams],
  );

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackOrderResult | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!orderNumber.trim() || !email.trim()) {
      setSubmitError("Please enter both your order number and email.");
      return;
    }

    setIsLoading(true);
    setSubmitError(null);

    const response = await fetch(
      `/api/orders/${encodeURIComponent(orderNumber.trim())}?email=${encodeURIComponent(
        email.trim().toLowerCase(),
      )}`,
      {
        cache: "no-store",
      },
    );

    const payload = (await response.json().catch(() => null)) as
      | { order?: TrackOrderResult; error?: string }
      | null;

    setIsLoading(false);

    if (!response.ok || !payload?.order) {
      setResult(null);
      setSubmitError(payload?.error ?? "Unable to find this order.");
      return;
    }

    setResult(payload.order);
  };

  const providerLine = [result?.shippingProvider, result?.shippingServiceName]
    .filter(Boolean)
    .join(" - ");

  return (
    <div className="page-stack">
      <section className="section-card reveal reveal-delay-1">
        <p className="eyebrow">Track Order</p>
        <h1 className="page-title">Check your shipment anytime</h1>
        <p className="page-subtitle">
          Enter your order number and order email to view shipping status, latest delivery
          updates, and your courier tracking link.
        </p>

        <form className="track-order-form" onSubmit={handleSubmit}>
          <div className="field-grid">
            <label>
              Order number
              <input
                required
                type="text"
                name="orderNumber"
                placeholder="SR-20260408-4821"
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
              />
            </label>
            <label>
              Email used on order
              <input
                required
                type="email"
                name="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
          </div>

          <div className="hero-actions">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? "Checking status..." : "Track order"}
            </button>
            <Link href={`mailto:${siteConfig.support.email}`} className="btn btn-outline">
              Connect over email
            </Link>
          </div>
        </form>

        {submitError ? <p className="form-error">{submitError}</p> : null}
      </section>

      {result ? (
        <>
          <section className="section-card track-order-summary reveal reveal-delay-2">
            <div className="section-head">
              <div>
                <p className="eyebrow">Order Summary</p>
                <h2>{result.orderNumber}</h2>
              </div>
              <span className={`status-pill ${getStatusTone(result.shipmentStatus)}`}>
                {toShipmentStatusLabel(result.shipmentStatus)}
              </span>
            </div>

            <div className="track-order-grid">
              <article className="track-order-card">
                <h3>Customer</h3>
                <p>{result.customerName}</p>
                <span>{result.email}</span>
              </article>
              <article className="track-order-card">
                <h3>Payment</h3>
                <p>{result.paymentStatus}</p>
                <span>Order placed on {new Date(result.createdAt).toLocaleString()}</span>
              </article>
              <article className="track-order-card">
                <h3>Shipping partner</h3>
                <p>{providerLine || "Preparing shipment"}</p>
                <span>
                  {result.shipmentUpdatedAt
                    ? `Last update: ${new Date(result.shipmentUpdatedAt).toLocaleString()}`
                    : "Tracking will appear after dispatch"}
                </span>
              </article>
              <article className="track-order-card">
                <h3>Tracking</h3>
                <p>{result.trackingNumber || "Will be added once booked"}</p>
                <span>
                  {result.deliveredAt
                    ? `Delivered on ${new Date(result.deliveredAt).toLocaleString()}`
                    : "Courier events will appear below"}
                </span>
              </article>
            </div>

            <div className="hero-actions">
              {result.trackingUrl ? (
                <a
                  href={result.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                >
                  Open courier tracking
                </a>
              ) : null}
              <a
                href={`https://wa.me/${siteConfig.support.whatsappNumber}?text=${encodeURIComponent(
                  `Hi Swarna Roots, I need help with order ${result.orderNumber}.`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
              >
                WhatsApp support
              </a>
            </div>
          </section>

          <section className="section-card reveal reveal-delay-3">
            <div className="section-head">
              <h2>Shipment timeline</h2>
              <span className="track-order-meta">
                Total order value: INR {Math.round(result.total)}
              </span>
            </div>

            {result.shipmentEvents.length > 0 ? (
              <div className="tracking-timeline">
                {result.shipmentEvents.map((event, index) => (
                  <article key={`${event.status}-${event.eventAt}-${index}`} className="tracking-event">
                    <div className="tracking-event-marker" aria-hidden="true" />
                    <div className="tracking-event-body">
                      <div className="tracking-event-head">
                        <strong>{event.title}</strong>
                        <span>{new Date(event.eventAt).toLocaleString()}</span>
                      </div>
                      {event.description ? <p>{event.description}</p> : null}
                      {event.location ? <small>{event.location}</small> : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h1>Shipment updates will appear here</h1>
                <p>
                  Your order is confirmed. As soon as shipping is booked, this page will start
                  showing courier updates.
                </p>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
