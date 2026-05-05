import { NextResponse } from "next/server";
import { getPersistedStorefrontSettings } from "@/src/lib/storefront-settings";

export async function GET() {
  const settings = await getPersistedStorefrontSettings();
  return NextResponse.json({ settings });
}
