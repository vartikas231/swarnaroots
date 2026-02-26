import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SALT_BYTES = 16;
const KEY_LENGTH = 64;

export function hashPassword(rawPassword: string): string {
  const password = rawPassword.trim();
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(rawPassword: string, encodedPassword: string): boolean {
  const [salt, storedHash] = encodedPassword.split(":");
  if (!salt || !storedHash) {
    return false;
  }

  const password = rawPassword.trim();
  const candidate = scryptSync(password, salt, KEY_LENGTH);
  const stored = Buffer.from(storedHash, "hex");

  if (stored.length !== candidate.length) {
    return false;
  }

  return timingSafeEqual(stored, candidate);
}
