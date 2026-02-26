import crypto from "node:crypto";
import Razorpay from "razorpay";

let razorpayClient: Razorpay | null = null;

function getTrimmedEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

export function getRazorpayKeyId() {
  const keyId = getTrimmedEnv("RAZORPAY_KEY_ID");
  if (!keyId) {
    throw new Error("RAZORPAY_KEY_ID is not configured.");
  }
  return keyId;
}

function getRazorpayKeySecret() {
  const keySecret = getTrimmedEnv("RAZORPAY_KEY_SECRET");
  if (!keySecret) {
    throw new Error("RAZORPAY_KEY_SECRET is not configured.");
  }
  return keySecret;
}

export function getRazorpayClient() {
  if (razorpayClient) {
    return razorpayClient;
  }

  razorpayClient = new Razorpay({
    key_id: getRazorpayKeyId(),
    key_secret: getRazorpayKeySecret(),
  });

  return razorpayClient;
}

export function verifyRazorpayPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const payload = `${input.orderId}|${input.paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", getRazorpayKeySecret())
    .update(payload)
    .digest("hex");

  if (expectedSignature.length !== input.signature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(input.signature),
  );
}
