import { randomBytes } from "crypto";

export function generateReferenceNumber(): string {
    const suffix = randomBytes(4).toString("hex").toUpperCase();
    return `TKT-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}
