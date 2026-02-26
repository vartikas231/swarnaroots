import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/src/lib/db";
import { getRazorpayClient, getRazorpayKeyId } from "@/src/lib/razorpay";

const orderItemSchema = z.object({
  productId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  quantity: z.number().int().min(1),
  price: z.number().positive(),
  unitLabel: z.string().trim().min(1),
});

const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email(),
    phone: z.string().trim().min(8).max(20),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    pincode: z.string().trim().min(4).max(12),
    address: z.string().trim().min(5).max(250),
  }),
  paymentMethod: z.enum(["upi", "card"]),
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
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout payload." }, { status: 400 });
  }

  const { customer, paymentMethod, items } = parsed.data;
  const email = customer.email.trim().toLowerCase();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal > 0 && subtotal < 999 ? 60 : 0;
  const total = subtotal + shippingCost;
  const amountInPaise = Math.round(total * 100);

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
          paymentStatus: "PENDING",
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
    } catch {
      if (attempt === 4) {
        return NextResponse.json(
          { error: "Unable to reserve order number. Please retry." },
          { status: 500 },
        );
      }
    }
  }

  if (!createdOrderNumber) {
    return NextResponse.json({ error: "Unable to create order." }, { status: 500 });
  }

  try {
    const razorpay = getRazorpayClient();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: createdOrderNumber,
      notes: {
        order_number: createdOrderNumber,
        customer_email: email,
        preferred_method: paymentMethod,
      },
    });

    return NextResponse.json({
      orderNumber: createdOrderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: getRazorpayKeyId(),
    });
  } catch (error) {
    await db.quickOrder.update({
      where: { orderNumber: createdOrderNumber },
      data: { paymentStatus: "FAILED" },
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start payment gateway.",
      },
      { status: 500 },
    );
  }
}
