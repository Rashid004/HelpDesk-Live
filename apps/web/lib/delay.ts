/**
 * Simulate network latency for the mock API layer.
 * TODO: delete once lib/api.ts talks to the real backend.
 */
export function delay(ms = 900): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Random latency inside a range, so loading states look real. */
export function jitter(min = 800, max = 1200): Promise<void> {
  return delay(Math.round(min + Math.random() * (max - min)));
}
