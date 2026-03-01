import { NextResponse } from "next/server";
import {
  applyQuickOrderPaymentStatus,
  toQuickOrderResponse,
} from "@/src/lib/quick-orders";
import {
  getRazorpayClient,
  verifyRazorpayWebhookSignature,
} from "@/src/lib/razorpay";

export const runtime = "nodejs";

interface RazorpayWebhookEvent {
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        method?: string;
        notes?: {
          order_number?: string;
        };
      };
    };
    order?: {
      entity?: {
        id?: string;
        receipt?: string;
        notes?: {
          order_number?: string;
        };
      };
    };
  };
}

async function resolveOrderNumber(event: RazorpayWebhookEvent) {
  const orderNumberFromNotes =
    event.payload?.payment?.entity?.notes?.order_number?.trim() ||
    event.payload?.order?.entity?.notes?.order_number?.trim() ||
    event.payload?.order?.entity?.receipt?.trim();

  if (orderNumberFromNotes) {
    return orderNumberFromNotes;
  }

  const razorpayOrderId =
    event.payload?.payment?.entity?.order_id ?? event.payload?.order?.entity?.id;

  if (!razorpayOrderId) {
    return null;
  }

  const razorpay = getRazorpayClient();
  const razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);
  if (typeof razorpayOrder.receipt === "string" && razorpayOrder.receipt.trim()) {
    return razorpayOrder.receipt.trim();
  }
  return null;
}

export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature")?.trim();
  if (!signature) {
    return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  let signatureValid = false;
  try {
    signatureValid = verifyRazorpayWebhookSignature({
      rawBody,
      signature,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Webhook secret not configured.",
      },
      { status: 500 },
    );
  }

  if (!signatureValid) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const eventName = event.event;
  const orderNumber = await resolveOrderNumber(event);

  if (!orderNumber) {
    return NextResponse.json({
      ok: true,
      handled: false,
      reason: "Order number not resolvable from webhook payload.",
      event: eventName,
    });
  }

  if (eventName === "payment.captured" || eventName === "order.paid") {
    const updated = await applyQuickOrderPaymentStatus({
      orderNumber,
      paymentStatus: "PAID",
      paymentMethod: event.payload?.payment?.entity?.method,
      reason: `Webhook event ${eventName}.`,
    });

    return NextResponse.json({
      ok: true,
      handled: true,
      event: eventName,
      order: updated ? toQuickOrderResponse(updated) : null,
    });
  }

  if (eventName === "payment.failed") {
    const updated = await applyQuickOrderPaymentStatus({
      orderNumber,
      paymentStatus: "FAILED",
      paymentMethod: event.payload?.payment?.entity?.method,
      reason: "Webhook event payment.failed.",
    });

    return NextResponse.json({
      ok: true,
      handled: true,
      event: eventName,
      order: updated ? toQuickOrderResponse(updated) : null,
    });
  }

  return NextResponse.json({
    ok: true,
    handled: false,
    event: eventName,
  });
}
