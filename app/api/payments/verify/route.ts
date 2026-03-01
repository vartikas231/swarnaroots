import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/src/lib/db";
import {
  getRazorpayClient,
  verifyRazorpayPaymentSignature,
} from "@/src/lib/razorpay";
import {
  applyQuickOrderPaymentStatus,
  toQuickOrderResponse,
} from "@/src/lib/quick-orders";

const verifySchema = z.object({
  razorpay_order_id: z.string().trim().min(1),
  razorpay_payment_id: z.string().trim().min(1),
  razorpay_signature: z.string().trim().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid verification payload." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
  const signatureValid = verifyRazorpayPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!signatureValid) {
    return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
  }

  const razorpay = getRazorpayClient();
  const gatewayOrder = await razorpay.orders.fetch(razorpay_order_id);
  const orderNumber =
    typeof gatewayOrder.receipt === "string" ? gatewayOrder.receipt.trim() : "";

  if (!orderNumber) {
    return NextResponse.json(
      { error: "Unable to map payment to order." },
      { status: 400 },
    );
  }

  const quickOrder = await db.quickOrder.findUnique({
    where: { orderNumber },
  });

  if (!quickOrder) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const updatedOrder = await applyQuickOrderPaymentStatus({
    orderNumber: quickOrder.orderNumber,
    paymentStatus: "PAID",
    reason: `Verification callback. Razorpay payment ID: ${razorpay_payment_id}.`,
  });

  if (!updatedOrder) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const payload = toQuickOrderResponse(updatedOrder);

  return NextResponse.json({
    orderNumber: payload.orderNumber,
    paymentStatus: "PAID",
    paymentMethod: payload.paymentMethod,
    email: {
      status: payload.emailStatus === "sent" ? "sent" : "queued",
    },
  });
}
