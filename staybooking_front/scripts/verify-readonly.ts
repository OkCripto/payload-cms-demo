/**
 * Sanity check for the read-only contract (AGENTS.md §2).
 *
 * Connects with DATABASE_READONLY_URL (the staybooking_readonly role) and:
 *   1. runs a SELECT to prove the role can read,
 *   2. attempts a throwaway INSERT into locations to prove Postgres
 *      REJECTS writes with "permission denied".
 *
 * Run:  npx tsx scripts/verify-readonly.ts
 * (or:  node --experimental-strip-types scripts/verify-readonly.ts  on Node 22+)
 *
 * Exits 0 only if the INSERT fails with a permission error.
 */
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_READONLY_URL;
if (!connectionString) {
  console.error(
    "Set DATABASE_READONLY_URL first (see .env.example), e.g.\n" +
      "  DATABASE_READONLY_URL='postgresql://…' npx tsx scripts/verify-readonly.ts",
  );
  process.exit(2);
}

const sql = neon(connectionString);

// 1. Read must work.
const [who] = await sql`select current_user as user, count(*)::int as stays from stays`;
console.log(`✔ SELECT OK — connected as "${who.user}", found ${who.stays} stay(s)`);

if (who.user !== "staybooking_readonly") {
  console.error(
    `✖ Expected to connect as "staybooking_readonly" but connected as "${who.user}". ` +
      `DATABASE_READONLY_URL does not point at the read-only role.`,
  );
  process.exit(2);
}

// 2. Write must be rejected. neon-http sends each query as its own HTTP
//    request; a failed statement rejects the promise instead of aborting a
//    transaction, which makes the rejected-write assertion straightforward.
try {
  await sql`
    insert into locations (label, slug, generate_slug)
    values ('__readonly_probe__', '__readonly_probe__', false)
  `;
  console.error(
    "✖ WRITE SUCCEEDED — this role can INSERT, which violates the read-only " +
      "contract. Re-run scripts/readonly-role.sql and re-check the grants.",
  );
  process.exit(1);
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  if (/permission denied/i.test(message)) {
    console.log(`✔ WRITE REJECTED by Postgres — ${message.trim()}`);
    console.log("\nRead-only contract verified ✅");
    process.exit(0);
  }
  console.error(`✖ INSERT failed, but with an unexpected error (investigate): ${message}`);
  process.exit(1);
}
