import { NextResponse } from "next/server";
import { getStorefrontProductOverrides } from "@/src/lib/storefront-products";

export async function GET() {
  const products = await getStorefrontProductOverrides();
  return NextResponse.json({ products });
}
