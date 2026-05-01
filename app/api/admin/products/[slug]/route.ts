import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/src/lib/auth";
import { herbCatalog } from "@/app/data/herbs";
import { upsertStorefrontProductImages } from "@/src/lib/storefront-products";

function isAdminRole(role: string | undefined): role is "ADMIN" | "SUPER_ADMIN" {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

const imageSchema = z
  .array(z.string().trim().url().max(1000))
  .min(1)
  .max(5);

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!isAdminRole(role)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { slug } = await context.params;
  const decodedSlug = decodeURIComponent(slug).trim();
  if (!decodedSlug) {
    return NextResponse.json({ error: "Product slug is required." }, { status: 400 });
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = z.object({ images: imageSchema }).safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid image payload." }, { status: 400 });
  }

  const product = herbCatalog.find((item) => item.slug === decodedSlug);
  if (!product) {
    return NextResponse.json(
      { error: "Only catalog products can be updated right now." },
      { status: 404 },
    );
  }

  const updated = await upsertStorefrontProductImages(product, parsed.data.images);

  return NextResponse.json({
    product: {
      slug: updated.slug,
      images: updated.images,
    },
  });
}
