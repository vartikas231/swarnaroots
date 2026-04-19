import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import { toQuickOrderResponse } from "@/src/lib/quick-orders";

function isAdminRole(role: string | undefined): role is "ADMIN" | "SUPER_ADMIN" {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(100),
  status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!isAdminRole(role)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const parsedQuery = querySchema.safeParse({
    limit: url.searchParams.get("limit") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json({ error: "Invalid query params." }, { status: 400 });
  }

  const { limit, status } = parsedQuery.data;

  const orders = await db.quickOrder.findMany({
    where: {
      paymentStatus: status,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      shipmentEvents: {
        orderBy: { eventAt: "desc" },
        take: 5,
      },
    },
  });

  return NextResponse.json({
    orders: orders.map((order) => toQuickOrderResponse(order)),
  });
}
