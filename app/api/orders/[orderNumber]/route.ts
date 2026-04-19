import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";

interface RouteContext {
  params: Promise<{
    orderNumber: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { orderNumber } = await context.params;
  const decodedOrderNumber = decodeURIComponent(orderNumber).trim();
  const url = new URL(request.url);
  const email = url.searchParams.get("email")?.trim().toLowerCase();

  if (!decodedOrderNumber || !email) {
    return NextResponse.json(
      { error: "Order number and email are required." },
      { status: 400 },
    );
  }

  const order = await db.quickOrder.findFirst({
    where: {
      orderNumber: decodedOrderNumber,
      email,
    },
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
    order: {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      email: order.email,
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      paymentStatus: order.paymentStatus,
      shipmentStatus: order.shipmentStatus,
      shippingProvider: order.shippingProvider,
      shippingServiceName: order.shippingServiceName,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      shipmentUpdatedAt: order.shipmentUpdatedAt?.toISOString() ?? null,
      deliveredAt: order.deliveredAt?.toISOString() ?? null,
      shipmentEvents: order.shipmentEvents.map((event) => ({
        status: event.status,
        title: event.title,
        description: event.description,
        location: event.location,
        eventAt: event.eventAt.toISOString(),
      })),
    },
  });
}
