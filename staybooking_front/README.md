# staybooking_front

Public short-stays marketplace (Next.js, App Router). Reads listings and
filter options directly from the Neon Postgres database that
[`cms-dash`](../cms-dash) (Payload CMS) owns and writes. This app is
**read-only by contract** — see `../AGENTS.md` §2.

## Read-only database role

The frontend connects with a dedicated SELECT-only Postgres role:

1. Run `scripts/readonly-role.sql` in the Neon SQL editor (as your admin
   role). Replace the placeholder password and `<ADMIN_ROLE_NAME>` first.
   It creates `staybooking_readonly` with `CONNECT` + `USAGE` + `SELECT` on
   all current tables, and `ALTER DEFAULT PRIVILEGES` so tables created by
   future Payload migrations are readable automatically.
   **Never grant this role INSERT/UPDATE/DELETE/TRUNCATE or DDL.**
2. Copy `.env.example` to `.env.local` and fill in `DATABASE_READONLY_URL`
   (pooled hostname, `sslmode=require`).
3. Verify the contract:

   ```sh
   DATABASE_READONLY_URL='postgresql://…' npx tsx scripts/verify-readonly.ts
   ```

   The script expects the probe `INSERT` to fail with `permission denied`.

## Data layer

- `lib/db/schema.ts` — Drizzle schema mirroring the actual Payload-generated
  tables (see the migration in `cms-dash/src/migrations/`). Payload models
  the `imageUrls` array and the `amenities` hasMany relationship as child
  tables (`stays_image_urls`, `stays_rels`), not native arrays/join tables.
- `lib/db/index.ts` — Drizzle over `@neondatabase/serverless`'s HTTP driver
  (`drizzle-orm/neon-http`). Queries travel over `fetch()`, which is what the
  Cloudflare Workers runtime supports (no raw TCP / Hyperdrive needed).
- `lib/queries.ts` — SELECT-only query functions: filter option lists,
  price bounds, and the filtered stays listing.

Filter options (locations, property types, stay types, amenities) are
queried live from the lookup tables, so values added in `cms-dash` appear
here without a code change or redeploy.

## Develop

```sh
npm install
npm run dev
```

## Deploy (Cloudflare Workers)

Set `DATABASE_READONLY_URL` as a Worker secret
(`npx wrangler secret put DATABASE_READONLY_URL`).
