import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import { hashPassword } from "@/src/lib/password";

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]).default("ADMIN"),
});

function isAdminRole(role: string | undefined): role is "ADMIN" | "SUPER_ADMIN" {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!isAdminRole(role)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const users = await db.user.findMany({
    where: {
      role: {
        in: ["ADMIN", "SUPER_ADMIN"],
      },
    },
    orderBy: [{ role: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!isAdminRole(role)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = createUserSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid user payload." },
      { status: 400 },
    );
  }

  if (parsed.data.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Only super admin can create another super admin." },
      { status: 403 },
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const exists = await db.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json(
      { error: "User with this email already exists." },
      { status: 409 },
    );
  }

  const user = await db.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      password: hashPassword(parsed.data.password),
      role: parsed.data.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
