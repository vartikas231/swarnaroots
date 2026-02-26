import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/src/lib/db";
import { hashPassword } from "@/src/lib/password";

const setupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
});

export async function GET() {
  const adminCount = await db.user.count({
    where: {
      role: {
        in: ["ADMIN", "SUPER_ADMIN"],
      },
    },
  });

  return NextResponse.json({ needsBootstrap: adminCount === 0 });
}

export async function POST(request: Request) {
  const adminCount = await db.user.count({
    where: {
      role: {
        in: ["ADMIN", "SUPER_ADMIN"],
      },
    },
  });

  if (adminCount > 0) {
    return NextResponse.json(
      { error: "Admin accounts already exist." },
      { status: 409 },
    );
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = setupSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid setup payload." },
      { status: 400 },
    );
  }

  const name = parsed.data.name.trim();
  const email = parsed.data.email.trim().toLowerCase();
  const passwordHash = hashPassword(parsed.data.password);

  const user = await db.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role: "SUPER_ADMIN",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return NextResponse.json(
    {
      message: "Super admin created.",
      user,
    },
    { status: 201 },
  );
}
