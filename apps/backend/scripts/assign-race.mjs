/**
 * Race test: two agents claim the same ticket at the same instant.
 * Expectation: exactly one 2xx success, one 409 "already being assigned".
 *
 * Run (from apps/backend):
 *   BASE_URL=http://localhost:8000 \
 *   TICKET_ID=<unassigned ticket id> \
 *   AGENT1_TOKEN=<jwt> \
 *   AGENT2_TOKEN=<jwt> \
 *   node scripts/assign-race.mjs
 */
import axios from "axios";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:8000";
const TICKET_ID = process.env.TICKET_ID;
const TOKENS = [process.env.AGENT1_TOKEN, process.env.AGENT2_TOKEN];

if (!TICKET_ID || !TOKENS[0] || !TOKENS[1]) {
  console.error("Missing env: TICKET_ID, AGENT1_TOKEN, AGENT2_TOKEN required");
  process.exit(1);
}

const claim = (token, label) =>
  axios
    .patch(
      `${BASE_URL}/api/tickets/${TICKET_ID}/claim`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    )
    .then((res) => ({ label, ok: true, status: res.status, body: res.data }))
    .catch((err) => ({
      label,
      ok: false,
      status: err.response?.status,
      body: err.response?.data ?? err.message,
    }));

// Both requests dispatched before either resolves -> real contention.
const results = await Promise.all([
  claim(TOKENS[0], "agent-1"),
  claim(TOKENS[1], "agent-2"),
]);

for (const r of results) {
  console.log(`\n[${r.label}] status=${r.status} ok=${r.ok}`);
  console.log(JSON.stringify(r.body, null, 2));
}

const successes = results.filter((r) => r.ok);
const conflicts = results.filter((r) => r.status === 409);

console.log("\n--- verdict ---");
if (successes.length === 1 && conflicts.length === 1) {
  console.log("PASS: one claim succeeded, the other got 409");
  process.exit(0);
}
console.log(
  `FAIL: successes=${successes.length} conflicts=${conflicts.length} ` +
    `(expected 1 and 1)`,
);
process.exit(1);
