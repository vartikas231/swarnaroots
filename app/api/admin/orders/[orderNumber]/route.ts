import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/src/lib/auth";
import {
  applyQuickOrderPaymentStatus,
  toQuickOrderResponse,
} from "@/src/lib/quick-orders";

function isAdminRole(role: string | undefined): role is "ADMIN" | "SUPER_ADMIN" {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

const updateSchema = z.object({
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]),
  paymentMethod: z.string().trim().min(2).max(40).optional(),
});

interface RouteContext {
  params: Promise<{
    orderNumber: string;
  }>;
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

  const updated = await applyQuickOrderPaymentStatus({
    orderNumber: decodedOrderNumber,
    paymentStatus: parsed.data.paymentStatus,
    paymentMethod: parsed.data.paymentMethod,
    reason: `Admin update by ${session?.user?.email ?? "admin"}`,
  });

  if (!updated) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({
    order: toQuickOrderResponse(updated),
  });
}
