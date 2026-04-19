import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { ShipmentStatus } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import {
  applyQuickOrderPaymentStatus,
  applyQuickOrderShippingUpdate,
  toQuickOrderResponse,
} from "@/src/lib/quick-orders";

function isAdminRole(role: string | undefined): role is "ADMIN" | "SUPER_ADMIN" {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

const shipmentStatusSchema = z.enum([
  "NOT_BOOKED",
  "BOOKED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED_ATTEMPT",
  "RTO_INITIATED",
  "RTO_DELIVERED",
  "CANCELLED",
]);

const updateSchema = z
  .object({
    paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
    paymentMethod: z.string().trim().min(2).max(40).optional(),
    shippingProvider: z.string().trim().min(2).max(80).optional(),
    shippingServiceName: z.string().trim().min(2).max(120).optional(),
    shipmentStatus: shipmentStatusSchema.optional(),
    trackingNumber: z.string().trim().min(2).max(120).optional(),
    trackingUrl: z.string().trim().url().max(500).optional(),
    shippingLabel: z.string().trim().min(2).max(120).optional(),
    shippingNotes: z.string().trim().max(1000).optional(),
    eventTitle: z.string().trim().min(2).max(120).optional(),
    eventDescription: z.string().trim().max(1000).optional(),
    eventLocation: z.string().trim().max(160).optional(),
    eventAt: z.string().datetime().optional(),
  })
  .refine(
    (value) =>
      Boolean(
        value.paymentStatus ??
          value.paymentMethod ??
          value.shippingProvider ??
          value.shippingServiceName ??
          value.shipmentStatus ??
          value.trackingNumber ??
          value.trackingUrl ??
          value.shippingLabel ??
          value.shippingNotes ??
          value.eventTitle ??
          value.eventDescription ??
          value.eventLocation ??
          value.eventAt,
      ),
    { message: "At least one field must be provided." },
  );

interface RouteContext {
  params: Promise<{
    orderNumber: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!isAdminRole(role)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { orderNumber } = await context.params;
  const decodedOrderNumber = decodeURIComponent(orderNumber).trim();

  if (!decodedOrderNumber) {
    return NextResponse.json({ error: "Order number is required." }, { status: 400 });
  }

  const order = await db.quickOrder.findUnique({
    where: { orderNumber: decodedOrderNumber },
    include: {
      shipmentEvents: {
        orderBy: { eventAt: "desc" },
        take: 20,
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({
    order: toQuickOrderResponse(order),
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!isAdminRole(role)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { orderNumber } = await context.params;
  const decodedOrderNumber = decodeURIComponent(orderNumber).trim();

  if (!decodedOrderNumber) {
    return NextResponse.json({ error: "Order number is required." }, { status: 400 });
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (parsed.data.paymentStatus) {
    const paymentUpdated = await applyQuickOrderPaymentStatus({
      orderNumber: decodedOrderNumber,
      paymentStatus: parsed.data.paymentStatus,
      paymentMethod: parsed.data.paymentMethod,
      reason: `Admin update by ${session?.user?.email ?? "admin"}`,
    });

    if (!paymentUpdated) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
  }

  let updated = await applyQuickOrderShippingUpdate({
    orderNumber: decodedOrderNumber,
    shippingProvider: parsed.data.shippingProvider,
    shippingServiceName: parsed.data.shippingServiceName,
    shipmentStatus: parsed.data.shipmentStatus as ShipmentStatus | undefined,
    trackingNumber: parsed.data.trackingNumber,
    trackingUrl: parsed.data.trackingUrl,
    shippingLabel: parsed.data.shippingLabel,
    shippingNotes: parsed.data.shippingNotes,
    eventTitle: parsed.data.eventTitle,
    eventDescription: parsed.data.eventDescription,
    eventLocation: parsed.data.eventLocation,
    eventAt: parsed.data.eventAt,
    source: session?.user?.email ?? "admin",
  });

  if (!updated) {
    updated = await db.quickOrder.findUnique({
      where: { orderNumber: decodedOrderNumber },
      include: {
        shipmentEvents: {
          orderBy: { eventAt: "desc" },
          take: 20,
        },
      },
    });
  }

  if (!updated) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({
    order: toQuickOrderResponse(updated),
  });
}
