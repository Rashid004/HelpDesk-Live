import bcrypt from "bcrypt";
import { createHash } from "node:crypto";
import { SALT_ROUNDS } from "../utils/constants.js";

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Deterministic digest for refresh tokens: lets us look up a stored session
// by exact hash match instead of iterating bcrypt.compare over every session.
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
