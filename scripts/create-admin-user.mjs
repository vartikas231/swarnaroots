import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

function usage() {
  console.error(
    "Usage: npm run admin:create-user -- <email> <password> [name] [role]\nrole: ADMIN | SUPER_ADMIN",
  );
}

function hashPassword(rawPassword) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(rawPassword.trim(), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function run() {
  const emailArg = process.argv[2];
  const passwordArg = process.argv[3];
  const nameArg = process.argv[4] ?? null;
  const roleArg = (process.argv[5] ?? "ADMIN").toUpperCase();

  if (!emailArg || !passwordArg) {
    usage();
    process.exit(1);
  }

  if (!["ADMIN", "SUPER_ADMIN"].includes(roleArg)) {
    console.error("Invalid role. Use ADMIN or SUPER_ADMIN.");
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  const password = hashPassword(passwordArg);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: nameArg ?? existing.name,
        role: roleArg,
        password,
      },
    });
    console.log(`Updated admin user: ${email} (${roleArg})`);
  } else {
    await prisma.user.create({
      data: {
        email,
        password,
        name: nameArg,
        role: roleArg,
      },
    });
    console.log(`Created admin user: ${email} (${roleArg})`);
  }
}

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
