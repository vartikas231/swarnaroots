import type { PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/src/lib/db";
import { sendOrderConfirmationEmail } from "@/src/lib/email";

const orderItemsForEmailSchema = z.array(
  z.object({
    name: z.string().trim().min(1),
    quantity: z.number().int().min(1),
    unitLabel: z.string().trim().min(1),
  }),
);

export interface QuickOrderResponse {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
  addressLine: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  emailStatus: string;
  createdAt: string;
  updatedAt: string;
}

function asNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }
  return Number(value);
}

export function toQuickOrderResponse(order: {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
  addressLine: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  subtotal: unknown;
  shippingCost: unknown;
  total: unknown;
  emailStatus: string;
  createdAt: Date;
  updatedAt: Date;
}): QuickOrderResponse {
  return {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    city: order.city,
    state: order.state,
    pincode: order.pincode,
    addressLine: order.addressLine,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    subtotal: asNumber(order.subtotal),
    shippingCost: asNumber(order.shippingCost),
    total: asNumber(order.total),
    emailStatus: order.emailStatus,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export async function applyQuickOrderPaymentStatus(input: {
  orderNumber: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  reason?: string;
}) {
  const order = await db.quickOrder.findUnique({
    where: { orderNumber: input.orderNumber },
  });

  if (!order) {
    return null;
  }

  const nextPaymentMethod = input.paymentMethod?.trim().toUpperCase();
  const shouldUpdateStatus = order.paymentStatus !== input.paymentStatus;
  const shouldUpdateMethod =
    Boolean(nextPaymentMethod) && nextPaymentMethod !== order.paymentMethod;

  if (shouldUpdateStatus || shouldUpdateMethod) {
    await db.quickOrder.update({
      where: { orderNumber: order.orderNumber },
      data: {
        paymentStatus: input.paymentStatus,
        paymentMethod: shouldUpdateMethod ? nextPaymentMethod : undefined,
      },
    });
  }

  if (input.paymentStatus !== "PAID") {
    const updated = await db.quickOrder.findUnique({
      where: { orderNumber: order.orderNumber },
    });
    return updated ?? order;
  }

  const emailLock = await db.quickOrder.updateMany({
    where: {
      orderNumber: order.orderNumber,
      emailStatus: {
        not: "sent",
      },
    },
    data: {
      emailStatus: "sending",
    },
  });

  if (emailLock.count === 1) {
    const orderForEmail = await db.quickOrder.findUnique({
      where: { orderNumber: order.orderNumber },
    });

    if (!orderForEmail) {
      return order;
    }

    const parsedItems = orderItemsForEmailSchema.safeParse(orderForEmail.items);
    const itemsForEmail = parsedItems.success ? parsedItems.data : [];

    const emailResult = await sendOrderConfirmationEmail({
      to: orderForEmail.email,
      customerName: orderForEmail.customerName,
      orderNumber: orderForEmail.orderNumber,
      total: asNumber(orderForEmail.total),
      paymentMethod: orderForEmail.paymentMethod,
      items: itemsForEmail,
    });

    const nextEmailStatus = emailResult.sent ? "sent" : "queued";

    await db.quickOrder.update({
      where: { orderNumber: orderForEmail.orderNumber },
      data: { emailStatus: nextEmailStatus },
    });

    await db.notification.create({
      data: {
        type: "ORDER_CONFIRMATION",
        channel: "email",
        recipient: orderForEmail.email,
        subject: `Order Confirmed: ${orderForEmail.orderNumber}`,
        body: emailResult.sent
          ? `Payment confirmed for ${orderForEmail.orderNumber}.`
          : `Payment confirmed for ${orderForEmail.orderNumber}. Email delivery queued.`,
        status: emailResult.sent ? "sent" : "pending",
        sentAt: emailResult.sent ? new Date() : null,
      },
    });
  }

  const updated = await db.quickOrder.findUnique({
    where: { orderNumber: order.orderNumber },
  });

  return updated ?? order;
}
