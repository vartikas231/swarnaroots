import { Resend } from "resend";

interface OrderEmailItem {
  name: string;
  quantity: number;
  unitLabel: string;
}

interface SendOrderConfirmationInput {
  to: string;
  customerName: string;
  orderNumber: string;
  total: number;
  paymentMethod: string;
  items: OrderEmailItem[];
}

interface SendOrderConfirmationResult {
  sent: boolean;
  provider: "resend" | "console";
  error?: string;
}

const fromAddress = process.env.ORDER_EMAIL_FROM ?? "Swarna Roots <onboarding@resend.dev>";

function buildEmailText(input: SendOrderConfirmationInput) {
  const lines = input.items.map((item) => `- ${item.name} x ${item.quantity} (${item.unitLabel})`);
  return [
    `Hi ${input.customerName},`,
    "",
    `Your order ${input.orderNumber} has been received.`,
    `Payment method: ${input.paymentMethod.toUpperCase()}`,
    `Order total: INR ${Math.round(input.total)}`,
    "",
    "Items:",
    ...lines,
    "",
    "Thank you for choosing Swarna Roots.",
  ].join("\n");
}

function buildEmailHtml(input: SendOrderConfirmationInput) {
  const items = input.items
    .map((item) => `<li>${item.name} x ${item.quantity} (${item.unitLabel})</li>`)
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; color: #213328; line-height: 1.5;">
      <p>Hi ${input.customerName},</p>
      <p>Your order <strong>${input.orderNumber}</strong> has been received.</p>
      <p>
        Payment method: <strong>${input.paymentMethod.toUpperCase()}</strong><br />
        Order total: <strong>INR ${Math.round(input.total)}</strong>
      </p>
      <p><strong>Items:</strong></p>
      <ul>${items}</ul>
      <p>Thank you for choosing Swarna Roots.</p>
    </div>
  `;
}

export async function sendOrderConfirmationEmail(
  input: SendOrderConfirmationInput,
): Promise<SendOrderConfirmationResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const subject = `Order Confirmed: ${input.orderNumber}`;
  const text = buildEmailText(input);
  const html = buildEmailHtml(input);

  if (!apiKey) {
    console.log("[email:fallback] Missing RESEND_API_KEY, logging confirmation email.", {
      to: input.to,
      subject,
      text,
    });
    return { sent: false, provider: "console" };
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: fromAddress,
      to: [input.to],
      subject,
      text,
      html,
    });
    return { sent: true, provider: "resend" };
  } catch (error) {
    return {
      sent: false,
      provider: "resend",
      error: error instanceof Error ? error.message : "Unknown email send error.",
    };
  }
}
