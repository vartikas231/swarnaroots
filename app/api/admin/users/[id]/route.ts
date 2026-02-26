import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { db } from "@/src/lib/db";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const actorRole = session?.user?.role;
  const actorId = session?.user?.id;

  if (actorRole !== "SUPER_ADMIN" || !actorId) {
    return NextResponse.json(
      { error: "Only super admin can remove admin users." },
      { status: 403 },
    );
  }

  const params = await context.params;
  const userId = params.id;

  if (!userId) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  if (actorId === userId) {
    return NextResponse.json(
      { error: "You cannot remove your own active account." },
      { status: 400 },
    );
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!target || (target.role !== "ADMIN" && target.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Admin user not found." }, { status: 404 });
  }

  if (target.role === "SUPER_ADMIN") {
    const superAdminCount = await db.user.count({
      where: { role: "SUPER_ADMIN" },
    });
    if (superAdminCount <= 1) {
      return NextResponse.json(
        { error: "Cannot remove the last super admin account." },
        { status: 400 },
      );
    }
  }

  await db.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
