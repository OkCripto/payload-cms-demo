/**
 * Read-only Drizzle client for staybooking_front.
 *
 * - Uses Neon's serverless HTTP driver (@neondatabase/serverless via
 *   drizzle-orm/neon-http): queries travel over fetch(), which is what the
 *   Cloudflare Workers runtime supports. `pg` (node-postgres) needs raw TCP
 *   and would NOT work here without Hyperdrive.
 * - Requires DATABASE_READONLY_URL to point at the dedicated SELECT-only
 *   Postgres role (see scripts/verify-readonly.ts). This app must NEVER be
 *   given a role with INSERT/UPDATE/DELETE privileges.
 *
 * The client is lazy: the connection is only created on first query, so
 * importing this module never throws just because the env var is unset
 * (e.g. during build without env loaded).
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export const DATABASE_READONLY_URL_ENV = "DATABASE_READONLY_URL";

export type ReadOnlyDb = ReturnType<typeof createReadOnlyDb>;

function createReadOnlyDb() {
  const connectionString = process.env.DATABASE_READONLY_URL;
  if (!connectionString) {
    throw new Error(
      `Missing ${DATABASE_READONLY_URL_ENV} — copy .env.example to .env.local and set the ` +
        `SELECT-only Postgres role's connection string (see README "Read-only database role").`,
    );
  }
  // neon-http issues one HTTP request per query (no interactive transactions).
  // Every query here is a single SELECT, so that trade-off is exactly right
  // for a read-only marketplace frontend on Cloudflare Workers.
  return drizzle({ client: neon(connectionString), schema });
}

let cached: ReadOnlyDb | undefined;

/** Singleton read-only Drizzle client. Throws on first use if env is unset. */
export function getReadOnlyDb(): ReadOnlyDb {
  cached ??= createReadOnlyDb();
  return cached;
}
