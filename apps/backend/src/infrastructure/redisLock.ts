import { redis } from "./redis.js";

/**
 * TTL acts as a crash-safety net: if the process holding the lock dies
 * before releaseLock() runs, Redis expires the key on its own instead of
 * leaving the resource locked forever (a distributed deadlock).
 */
const LOCK_TTL_SECONDS = 10;

/**
 * Atomic compare-and-delete. Runs entirely inside Redis so nothing can
 * slip between the GET and the DEL. Only removes the key if we still own it.
 */
const RELEASE_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
end
return 0
`;

/**
 * Try to grab the lock for `lockKey`, tagging it with `ownerId`.
 *
 * Uses `SET key value NX EX ttl` — a single atomic command:
 *   NX  -> only set if the key does not already exist (this IS the acquire)
 *   EX  -> auto-expire after ttl seconds
 *
 * Redis replies "OK" when the key was set, or null when NX failed because
 * someone else holds the lock.
 *
 * Returns true if acquired, false if the lock is currently held elsewhere.
 */
export const acquireLock = async (
    lockKey: string,
    ownerId: string,
): Promise<boolean> => {
    // Redis is optional in this project. With no Redis there is no lock to
    // take; callers must still treat the DB as the source of truth.
    if (!redis) return true;

    const result = await redis.set(lockKey, ownerId, "EX", LOCK_TTL_SECONDS, "NX");
    return result === "OK";
};

/**
 * Release the lock — but only if THIS owner still holds it.
 *
 * Why the ownership check: if our critical section outran LOCK_TTL_SECONDS,
 * our key already expired and another owner may have acquired a fresh lock.
 * A blind DEL would then delete *their* lock. The Lua script compares the
 * stored value to `ownerId` and deletes atomically, so we never stomp on
 * someone else's lock.
 */
export const releaseLock = async (
    lockKey: string,
    ownerId: string,
): Promise<void> => {
    if (!redis) return;
    await redis.eval(RELEASE_SCRIPT, 1, lockKey, ownerId);
};
