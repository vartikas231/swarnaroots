"use client";

import { useCart } from "@/app/components/cart-provider";
import { HerbalLoader } from "@/app/components/herbal-loader";
import { useStorefront } from "@/app/components/storefront-provider";
import { siteConfig } from "@/app/config/site";
import { formatPrice } from "@/app/lib/format";
import Link from "next/link";
import { FormEvent, useMemo, useRef, useState } from "react";

interface RazorpayPaymentSuccessPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  method?: "upi" | "card";
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler: (response: RazorpayPaymentSuccessPayload) => void | Promise<void>;
}

interface RazorpayCheckoutInstance {
  open: () => void;
}

interface ReverseGeocodeResponse {
  display_name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    state_district?: string;
    region?: string;
    postcode?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    hamlet?: string;
    house_number?: string;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

function loadRazorpayCheckoutScript() {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function pickFirstNonEmpty(...values: Array<string | undefined>) {
  for (const value of values) {
    const normalized = value?.trim();
    if (normalized) {
      return normalized;
    }
  }
  return "";
}

export default function CheckoutPage() {
  const { lineItems, subtotal, clearCart } = useCart();
  const { recordPayment } = useStorefront();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [orderLookupEmail, setOrderLookupEmail] = useState<string | null>(null);
  const [orderEmailStatus, setOrderEmailStatus] = useState<"sent" | "queued" | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [locationCoords, setLocationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const cityInputRef = useRef<HTMLInputElement | null>(null);
  const stateInputRef = useRef<HTMLInputElement | null>(null);
  const pincodeInputRef = useRef<HTMLInputElement | null>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);

  const shipping = subtotal > 0 && subtotal < 999 ? 60 : 0;
  const total = subtotal + shipping;

  const itemCount = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [lineItems]);

  const mapEmbedUrl = useMemo(() => {
    if (!locationCoords) {
      return "";
    }
    const delta = 0.015;
    const minLng = locationCoords.lng - delta;
    const minLat = locationCoords.lat - delta;
    const maxLng = locationCoords.lng + delta;
    const maxLat = locationCoords.lat + delta;
    const bbox = `${minLng},${minLat},${maxLng},${maxLat}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${locationCoords.lat}%2C${locationCoords.lng}`;
  }, [locationCoords]);

  const mapOpenUrl = useMemo(() => {
    if (!locationCoords) {
      return "";
    }
    return `https://www.google.com/maps/search/?api=1&query=${locationCoords.lat},${locationCoords.lng}`;
  }, [locationCoords]);

  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setLocationMessage("Geolocation is not supported on this device.");
      return;
    }

    setIsLocating(true);
    setLocationMessage("Detecting your current location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setLocationCoords({ lat, lng });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error("Failed to reverse geocode location.");
          }

          const payload = (await response.json()) as ReverseGeocodeResponse;
          const address = payload.address ?? {};
          const city = pickFirstNonEmpty(
            address.city,
            address.town,
            address.village,
            address.municipality,
            address.county,
          );
          const state = pickFirstNonEmpty(
            address.state,
            address.state_district,
            address.region,
          );
          const pincode = pickFirstNonEmpty(address.postcode);
          const primaryAddressLine = pickFirstNonEmpty(
            [address.house_number, address.road].filter(Boolean).join(" ").trim(),
            address.neighbourhood,
            address.suburb,
            address.hamlet,
          );
          const fallbackAddress = payload.display_name
            ?.split(",")
            .slice(0, 3)
            .join(",")
            .trim();
          const addressLine = pickFirstNonEmpty(primaryAddressLine, fallbackAddress);

          if (cityInputRef.current && city) {
            cityInputRef.current.value = city;
          }
          if (stateInputRef.current && state) {
            stateInputRef.current.value = state;
          }
          if (pincodeInputRef.current && pincode) {
            pincodeInputRef.current.value = pincode;
          }
          if (addressInputRef.current && addressLine) {
            addressInputRef.current.value = addressLine;
          }

          setLocationMessage(
            "Location detected and address fields auto-filled. Please verify before placing order.",
          );
        } catch {
          setLocationMessage(
            "Location captured. Please complete address fields manually if anything is missing.",
          );
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        setLocationMessage(
          "Unable to access your location. Allow location permission and try again.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      },
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (lineItems.length === 0) {
      return;
    }

    setSubmitError(null);
    const formData = new FormData(event.currentTarget);
    const customerName = String(formData.get("name") ?? "Customer");
    const customerEmail = String(formData.get("email") ?? "");
    const customerPhone = String(formData.get("phone") ?? "");
    const customerCity = String(formData.get("city") ?? "");
    const customerState = String(formData.get("state") ?? "");
    const customerPincode = String(formData.get("pincode") ?? "");
    const customerAddress = String(formData.get("address") ?? "");

    setIsSubmitting(true);
    const orderItems = lineItems.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      unitLabel: item.product.unitLabel,
    }));

    const customer = {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      city: customerCity,
      state: customerState,
      pincode: customerPincode,
      address: customerAddress,
    };

    if (paymentMethod === "cod") {
      const codResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer,
          paymentMethod,
          items: orderItems,
        }),
      });

      const codPayload = (await codResponse.json().catch(() => null)) as
        | {
            orderNumber?: string;
            paymentStatus?: "PAID" | "PENDING" | "FAILED";
            email?: { status?: "sent" | "queued" };
            error?: string;
          }
        | null;

      if (!codResponse.ok || !codPayload?.orderNumber) {
        setIsSubmitting(false);
        setSubmitError(codPayload?.error ?? "Unable to place order. Please try again.");
        return;
      }

      setOrderNumber(codPayload.orderNumber);
      setOrderLookupEmail(customerEmail);
      setOrderEmailStatus(codPayload.email?.status ?? "queued");
      recordPayment({
        orderNumber: codPayload.orderNumber,
        customerName,
        amount: total,
        method: "COD",
        status: codPayload.paymentStatus ?? "PENDING",
      });
      clearCart();
      setIsSubmitting(false);
      return;
    }

    const scriptLoaded = await loadRazorpayCheckoutScript();
    if (!scriptLoaded || !window.Razorpay) {
      setIsSubmitting(false);
      setSubmitError("Unable to load payment gateway. Please try again.");
      return;
    }

    const createGatewayOrderResponse = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer,
        paymentMethod,
        items: orderItems,
      }),
    });

    const createGatewayOrderPayload = (await createGatewayOrderResponse
      .json()
      .catch(() => null)) as
      | {
          orderNumber?: string;
          razorpayOrderId?: string;
          amount?: number;
          currency?: string;
          keyId?: string;
          error?: string;
        }
      | null;

    if (
      !createGatewayOrderResponse.ok ||
      !createGatewayOrderPayload?.razorpayOrderId ||
      !createGatewayOrderPayload?.keyId ||
      !createGatewayOrderPayload?.orderNumber ||
      !createGatewayOrderPayload?.amount
    ) {
      setIsSubmitting(false);
      setSubmitError(
        createGatewayOrderPayload?.error ??
          "Unable to start payment. Please try again.",
      );
      return;
    }

    const checkout = new window.Razorpay({
      key: createGatewayOrderPayload.keyId,
      amount: createGatewayOrderPayload.amount,
      currency: createGatewayOrderPayload.currency ?? "INR",
      name: siteConfig.brand.name,
      description: `Order ${createGatewayOrderPayload.orderNumber}`,
      order_id: createGatewayOrderPayload.razorpayOrderId,
      method: paymentMethod === "upi" ? "upi" : "card",
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      },
      notes: {
        order_number: createGatewayOrderPayload.orderNumber,
      },
      theme: {
        color: siteConfig.theme.jade,
      },
      modal: {
        ondismiss: () => {
          setIsSubmitting(false);
        },
      },
      handler: async (gatewayResponse) => {
        const verifyResponse = await fetch("/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(gatewayResponse),
        });

        const verifyPayload = (await verifyResponse.json().catch(() => null)) as
          | {
              orderNumber?: string;
              paymentStatus?: "PAID" | "PENDING" | "FAILED";
              email?: { status?: "sent" | "queued" };
              error?: string;
            }
          | null;

        if (!verifyResponse.ok || !verifyPayload?.orderNumber) {
          setSubmitError(
            verifyPayload?.error ??
              "Payment was captured, but verification failed. Please contact support.",
          );
          setIsSubmitting(false);
          return;
        }

        setOrderNumber(verifyPayload.orderNumber);
        setOrderLookupEmail(customerEmail);
        setOrderEmailStatus(verifyPayload.email?.status ?? "queued");
        recordPayment({
          orderNumber: verifyPayload.orderNumber,
          customerName,
          amount: total,
          method: paymentMethod.toUpperCase(),
          status: verifyPayload.paymentStatus ?? "PAID",
        });
        clearCart();
        setIsSubmitting(false);
      },
    });

    checkout.open();
  };

  if (orderNumber) {
    return (
      <section className="section-card success-state reveal reveal-delay-1">
        <p className="eyebrow">Order confirmed</p>
        <h1>Thank you for your purchase</h1>
        <p>
          Your order <strong>{orderNumber}</strong> has been placed successfully.
        </p>
        <p>
          {orderEmailStatus === "sent"
            ? "A confirmation email has been sent to your inbox."
            : "Order is confirmed. Email confirmation is queued and will be sent shortly."}
        </p>
        <div className="hero-actions">
          {orderLookupEmail ? (
            <Link
              href={`/track-order?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(orderLookupEmail)}`}
              className="btn btn-primary"
            >
              Track this order
            </Link>
          ) : null}
          <Link href="/shop" className="btn btn-primary">
            Continue shopping
          </Link>
          <Link href="/" className="btn btn-outline">
            Back home
          </Link>
        </div>
      </section>
    );
  }

  if (lineItems.length === 0) {
    return (
      <section className="section-card empty-state reveal reveal-delay-1">
        <h1>No items to checkout</h1>
        <p>Add products to your cart before moving to checkout.</p>
        <Link href="/shop" className="btn btn-primary">
          Shop herbs
        </Link>
      </section>
    );
  }

  return (
    <div className="checkout-layout">
      <section className="section-card reveal reveal-delay-1">
        <p className="eyebrow">Checkout</p>
        <h1 className="page-title">Delivery details</h1>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="field-grid">
            <label>
              Full name
              <input required type="text" name="name" placeholder="Riya Sharma" />
            </label>
            <label>
              Phone
              <input required type="tel" name="phone" placeholder="+91 98xxxxxx12" />
            </label>
            <label>
              Email
              <input required type="email" name="email" placeholder="riya@email.com" />
            </label>
            <label>
              City
              <input
                ref={cityInputRef}
                required
                type="text"
                name="city"
                placeholder="Mumbai"
              />
            </label>
            <label className="field-span-2">
              Address line
              <input
                ref={addressInputRef}
                required
                type="text"
                name="address"
                placeholder="House no, street, area"
              />
            </label>
            <label>
              State
              <input
                ref={stateInputRef}
                required
                type="text"
                name="state"
                placeholder="Maharashtra"
              />
            </label>
            <label>
              Pincode
              <input
                ref={pincodeInputRef}
                required
                type="text"
                name="pincode"
                placeholder="400001"
              />
            </label>
          </div>

          <article className="location-card">
            <div className="location-card-head">
              <strong>Location accuracy</strong>
              <button
                type="button"
                className="btn btn-outline btn-sm location-btn"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
              >
                {isLocating ? "Detecting..." : "Use Current Location"}
              </button>
            </div>
            <p>
              Auto-fill city, state, pincode, and address from your current position for
              accurate delivery details.
            </p>
            {locationMessage ? <p className="location-message">{locationMessage}</p> : null}
            {locationCoords ? (
              <div className="checkout-map-panel">
                <iframe
                  title="Delivery location preview map"
                  src={mapEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a href={mapOpenUrl} target="_blank" rel="noopener noreferrer">
                  Open in Google Maps
                </a>
              </div>
            ) : null}
          </article>

          <fieldset className="payment-methods">
            <legend>Payment method</legend>
            <label>
              <input
                type="radio"
                name="payment"
                value="upi"
                checked={paymentMethod === "upi"}
                onChange={(event) => setPaymentMethod(event.target.value as "upi")}
              />
              UPI (recommended)
            </label>
            <label>
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(event) =>
                  setPaymentMethod(event.target.value as "card")
                }
              />
              Credit / Debit Card
            </label>
            <label>
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(event) => setPaymentMethod(event.target.value as "cod")}
              />
              Cash on delivery
            </label>
          </fieldset>

          <article className="gateway-note">
            <p>Secure payment gateway</p>
            <strong>{siteConfig.payment.primaryGateway} checkout</strong>
            <span>
              Supports {siteConfig.payment.supportedMethods.join(", ")}. EMI can stay disabled
              from your gateway dashboard.
            </span>
          </article>

          <button type="submit" className="btn btn-primary btn-wide" disabled={isSubmitting}>
            {isSubmitting ? "Placing order..." : "Place order"}
          </button>
          {isSubmitting ? (
            <HerbalLoader
              compact
              title="Preparing your order"
              subtitle="Selecting herbs and packing your wellness blend..."
            />
          ) : null}
          {submitError ? <p className="form-error">{submitError}</p> : null}
        </form>
      </section>

      <aside className="section-card summary-card reveal reveal-delay-2">
        <h2>Order summary ({itemCount} items)</h2>
        <div className="summary-list">
          {lineItems.map((item) => (
            <div key={item.productId} className="summary-item">
              <div>
                <p>{item.product.name}</p>
                <span>
                  {item.quantity} x {formatPrice(item.product.price)}
                </span>
              </div>
              <strong>{formatPrice(item.lineTotal)}</strong>
            </div>
          ))}
        </div>
        <div className="summary-row">
          <span>Subtotal</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <strong>{shipping === 0 ? "Free" : formatPrice(shipping)}</strong>
        </div>
        <div className="summary-row summary-row--total">
          <span>Total to pay</span>
          <strong>{formatPrice(total)}</strong>
        </div>
      </aside>
    </div>
  );
}
