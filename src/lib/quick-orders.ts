import type { PaymentStatus, ShipmentStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/src/lib/db";
import {
  sendOrderConfirmationEmail,
  sendOrderShipmentUpdateEmail,
} from "@/src/lib/email";

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
  emailUpdatesEnabled: boolean;
  whatsappUpdatesEnabled: boolean;
  shippingProvider: string | null;
  shippingServiceName: string | null;
  shipmentStatus: ShipmentStatus;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippingLabel: string | null;
  shippingNotes: string | null;
  shipmentBookedAt: string | null;
  shipmentUpdatedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  shipmentEvents: QuickOrderShipmentEventResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface QuickOrderShipmentEventResponse {
  status: ShipmentStatus;
  title: string;
  description: string | null;
  location: string | null;
  source: string | null;
  eventAt: string;
  createdAt: string;
}

function asNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }
  return Number(value);
}

function asIsoStringOrNull(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function toShipmentStatusLabel(status: ShipmentStatus) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildShipmentEventTitle(status: ShipmentStatus) {
  switch (status) {
    case "BOOKED":
      return "Shipment booked";
    case "PICKED_UP":
      return "Shipment picked up";
    case "IN_TRANSIT":
      return "Shipment in transit";
    case "OUT_FOR_DELIVERY":
      return "Out for delivery";
    case "DELIVERED":
      return "Delivered";
    case "FAILED_ATTEMPT":
      return "Delivery attempt failed";
    case "RTO_INITIATED":
      return "Return initiated";
    case "RTO_DELIVERED":
      return "Return delivered";
    case "CANCELLED":
      return "Shipment cancelled";
    default:
      return "Shipment update";
  }
}

function toNotificationType(status: ShipmentStatus) {
  if (status === "DELIVERED") {
    return "ORDER_DELIVERED" as const;
  }

  if (["BOOKED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(status)) {
    return "ORDER_SHIPPED" as const;
  }

  return "ORDER_STATUS_UPDATE" as const;
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
  emailUpdatesEnabled?: boolean;
  whatsappUpdatesEnabled?: boolean;
  shippingProvider?: string | null;
  shippingServiceName?: string | null;
  shipmentStatus?: ShipmentStatus;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippingLabel?: string | null;
  shippingNotes?: string | null;
  shipmentBookedAt?: Date | null;
  shipmentUpdatedAt?: Date | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  shipmentEvents?: Array<{
    status: ShipmentStatus;
    title: string;
    description: string | null;
    location: string | null;
    source: string | null;
    eventAt: Date;
    createdAt: Date;
  }>;
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
    emailUpdatesEnabled: order.emailUpdatesEnabled ?? true,
    whatsappUpdatesEnabled: order.whatsappUpdatesEnabled ?? false,
    shippingProvider: order.shippingProvider ?? null,
    shippingServiceName: order.shippingServiceName ?? null,
    shipmentStatus: order.shipmentStatus ?? "NOT_BOOKED",
    trackingNumber: order.trackingNumber ?? null,
    trackingUrl: order.trackingUrl ?? null,
    shippingLabel: order.shippingLabel ?? null,
    shippingNotes: order.shippingNotes ?? null,
    shipmentBookedAt: asIsoStringOrNull(order.shipmentBookedAt),
    shipmentUpdatedAt: asIsoStringOrNull(order.shipmentUpdatedAt),
    shippedAt: asIsoStringOrNull(order.shippedAt),
    deliveredAt: asIsoStringOrNull(order.deliveredAt),
    shipmentEvents: (order.shipmentEvents ?? []).map((event) => ({
      status: event.status,
      title: event.title,
      description: event.description,
      location: event.location,
      source: event.source,
      eventAt: event.eventAt.toISOString(),
      createdAt: event.createdAt.toISOString(),
    })),
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

export async function applyQuickOrderShippingUpdate(input: {
  orderNumber: string;
  shippingProvider?: string;
  shippingServiceName?: string;
  shipmentStatus?: ShipmentStatus;
  trackingNumber?: string;
  trackingUrl?: string;
  shippingLabel?: string;
  shippingNotes?: string;
  eventTitle?: string;
  eventDescription?: string;
  eventLocation?: string;
  eventAt?: string;
  source?: string;
}) {
  const order = await db.quickOrder.findUnique({
    where: { orderNumber: input.orderNumber },
  });

  if (!order) {
    return null;
  }

  const hasShippingMutation =
    input.shippingProvider !== undefined ||
    input.shippingServiceName !== undefined ||
    input.shipmentStatus !== undefined ||
    input.trackingNumber !== undefined ||
    input.trackingUrl !== undefined ||
    input.shippingLabel !== undefined ||
    input.shippingNotes !== undefined ||
    input.eventTitle !== undefined ||
    input.eventDescription !== undefined ||
    input.eventLocation !== undefined ||
    input.eventAt !== undefined;

  if (!hasShippingMutation) {
    return db.quickOrder.findUnique({
      where: { orderNumber: order.orderNumber },
      include: {
        shipmentEvents: {
          orderBy: { eventAt: "desc" },
          take: 20,
        },
      },
    });
  }

  const now = new Date();
  const eventAt = input.eventAt ? new Date(input.eventAt) : now;
  const safeEventAt = Number.isNaN(eventAt.getTime()) ? now : eventAt;
  const nextShipmentStatus = input.shipmentStatus ?? order.shipmentStatus;
  const shipmentStatusChanged = nextShipmentStatus !== order.shipmentStatus;
  const shippingProvider =
    input.shippingProvider !== undefined
      ? input.shippingProvider.trim() || null
      : order.shippingProvider;
  const shippingServiceName =
    input.shippingServiceName !== undefined
      ? input.shippingServiceName.trim() || null
      : order.shippingServiceName;
  const trackingNumber =
    input.trackingNumber !== undefined
      ? input.trackingNumber.trim() || null
      : order.trackingNumber;
  const trackingUrl =
    input.trackingUrl !== undefined
      ? input.trackingUrl.trim() || null
      : order.trackingUrl;
  const shippingLabel =
    input.shippingLabel !== undefined
      ? input.shippingLabel.trim() || null
      : order.shippingLabel;
  const shippingNotes =
    input.shippingNotes !== undefined
      ? input.shippingNotes.trim() || null
      : order.shippingNotes;

  const nextShipmentBookedAt =
    nextShipmentStatus === "BOOKED" && !order.shipmentBookedAt
      ? safeEventAt
      : order.shipmentBookedAt;
  const nextShippedAt =
    ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(nextShipmentStatus) &&
    !order.shippedAt
      ? safeEventAt
      : order.shippedAt;
  const nextDeliveredAt =
    nextShipmentStatus === "DELIVERED" ? safeEventAt : order.deliveredAt;

  await db.quickOrder.update({
    where: { orderNumber: order.orderNumber },
    data: {
      shippingProvider,
      shippingServiceName,
      shipmentStatus: nextShipmentStatus,
      trackingNumber,
      trackingUrl,
      shippingLabel,
      shippingNotes,
      shipmentBookedAt: nextShipmentBookedAt,
      shipmentUpdatedAt: safeEventAt,
      shippedAt: nextShippedAt,
      deliveredAt: nextDeliveredAt,
    },
  });

  const shouldCreateEvent =
    shipmentStatusChanged ||
    Boolean(input.eventTitle?.trim()) ||
    Boolean(input.eventDescription?.trim()) ||
    Boolean(input.eventLocation?.trim());

  if (shouldCreateEvent) {
    await db.quickOrderShipmentEvent.create({
      data: {
        quickOrderId: order.id,
        status: nextShipmentStatus,
        title: input.eventTitle?.trim() || buildShipmentEventTitle(nextShipmentStatus),
        description: input.eventDescription?.trim() || null,
        location: input.eventLocation?.trim() || null,
        source: input.source?.trim() || "admin",
        eventAt: safeEventAt,
        metadata: {
          shippingProvider,
          shippingServiceName,
          trackingNumber,
          trackingUrl,
        },
      },
    });
  }

  if (shipmentStatusChanged && order.emailUpdatesEnabled) {
    const emailResult = await sendOrderShipmentUpdateEmail({
      to: order.email,
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      shipmentStatusLabel: toShipmentStatusLabel(nextShipmentStatus),
      shippingProvider,
      shippingServiceName,
      trackingNumber,
      trackingUrl,
    });

    await db.notification.create({
      data: {
        type: toNotificationType(nextShipmentStatus),
        channel: "email",
        recipient: order.email,
        subject: `Order Update: ${order.orderNumber}`,
        body: `${order.orderNumber} is now ${toShipmentStatusLabel(nextShipmentStatus)}.`,
        status: emailResult.sent ? "sent" : "pending",
        sentAt: emailResult.sent ? new Date() : null,
      },
    });
  }

  const updated = await db.quickOrder.findUnique({
    where: { orderNumber: order.orderNumber },
    include: {
      shipmentEvents: {
        orderBy: { eventAt: "desc" },
        take: 20,
      },
    },
  });

  return updated ?? order;
}
