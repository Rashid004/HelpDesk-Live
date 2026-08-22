import { randomUUID } from "crypto";
import { redis } from "./redis.js";

const LOCK_TTL_MS = 5000;

export async function withAssignmentLock<T>(
    ticketId: string,
    fn: () => Promise<T>,
): Promise<T> {
    if (!redis) return fn();

    const key = `ticket:assign-lock:${ticketId}`;
    const token = randomUUID();

    const acquired = await redis.set(key, token, "PX", LOCK_TTL_MS, "NX");
    if (!acquired) {
        throw new Error("Ticket is already being claimed by another agent");
    }

    try {
        return await fn();
    } finally {
        const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      end
      return 0
    `;
        await redis.eval(script, 1, key, token);
    }
}
