import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/src/lib/auth";
import { savePersistedStorefrontSettings } from "@/src/lib/storefront-settings";

function isAdminRole(role: string | undefined): role is "ADMIN" | "SUPER_ADMIN" {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

const payloadSchema = z.object({
  media: z
    .object({
      heroMediaUrls: z.array(z.string().trim().url()).max(8).optional(),
      reviewMediaUrls: z.array(z.string().trim().url()).max(8).optional(),
    })
    .optional(),
  paymentVisibility: z
    .object({
      visibleMethods: z.array(z.enum(["upi", "card", "cod"])).min(1),
    })
    .optional(),
});

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdminRole(session?.user?.role)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid storefront settings payload." }, { status: 400 });
  }

  const settings = await savePersistedStorefrontSettings(parsed.data);
  return NextResponse.json({ settings });
}
