import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/src/lib/db";
import { sendOrderConfirmationEmail } from "@/src/lib/email";

const orderItemSchema = z.object({
  productId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  quantity: z.number().int().min(1),
  price: z.number().positive(),
  unitLabel: z.string().trim().min(1),
});

const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email(),
    phone: z.string().trim().min(8).max(20),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    pincode: z.string().trim().min(4).max(12),
    address: z.string().trim().min(5).max(250),
  }),
  paymentMethod: z.enum(["upi", "card", "cod"]),
  items: z.array(orderItemSchema).min(1),
});

function getTodayToken() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function createOrderNumber() {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `SR-${getTodayToken()}-${suffix}`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order payload." }, { status: 400 });
  }

  const { customer, paymentMethod, items } = parsed.data;
  const email = customer.email.trim().toLowerCase();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal > 0 && subtotal < 999 ? 60 : 0;
  const total = subtotal + shippingCost;
  const paymentStatus = "PENDING" as const;

  let createdOrderNumber: string | null = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orderNumber = createOrderNumber();
    try {
      await db.quickOrder.create({
        data: {
          orderNumber,
          customerName: customer.name.trim(),
          email,
          phone: customer.phone.trim(),
          city: customer.city.trim(),
          state: customer.state.trim(),
          pincode: customer.pincode.trim(),
          addressLine: customer.address.trim(),
          paymentMethod: paymentMethod.toUpperCase(),
          paymentStatus,
          subtotal,
          shippingCost,
          total,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            lineTotal: item.price * item.quantity,
            unitLabel: item.unitLabel,
          })),
          emailStatus: "queued",
        },
      });
      createdOrderNumber = orderNumber;
      break;
    } catch (error) {
      if (attempt === 4) {
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Failed to create order.",
          },
          { status: 500 },
        );
      }
    }
  }

  if (!createdOrderNumber) {
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }

  const emailResult = await sendOrderConfirmationEmail({
    to: email,
    customerName: customer.name.trim(),
    orderNumber: createdOrderNumber,
    total,
    paymentMethod,
    items: items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitLabel: item.unitLabel,
    })),
  });

  await db.quickOrder.update({
    where: { orderNumber: createdOrderNumber },
    data: {
      emailStatus: emailResult.sent ? "sent" : "queued",
    },
  });

  await db.notification.create({
    data: {
      type: "ORDER_CONFIRMATION",
      channel: "email",
      recipient: email,
      subject: `Order Confirmed: ${createdOrderNumber}`,
      body: `Order ${createdOrderNumber} received. Total INR ${Math.round(total)}.`,
      status: emailResult.sent ? "sent" : "pending",
      sentAt: emailResult.sent ? new Date() : null,
    },
  });

  return NextResponse.json({
    orderNumber: createdOrderNumber,
    paymentStatus,
    email: {
      status: emailResult.sent ? "sent" : "queued",
      provider: emailResult.provider,
    },
  });
}
