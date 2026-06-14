import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(String(password), salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !String(storedHash).includes(":")) return false;

  const [salt, hash] = String(storedHash).split(":");
  if (!salt || !hash) return false;

  const derived = scryptSync(String(password), salt, KEY_LENGTH);
  const stored = Buffer.from(hash, "hex");

  if (derived.length !== stored.length) return false;
  return timingSafeEqual(derived, stored);
}
