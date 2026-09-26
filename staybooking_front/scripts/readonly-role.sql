-- ============================================================================
-- Read-only Postgres role for staybooking_front (run in the Neon SQL editor,
-- logged in as the project owner / admin role — the same one cms-dash uses).
--
-- ⚠️  SECURITY CONTRACT (AGENTS.md §2): this role is for the public
-- marketplace frontend and must NEVER be granted INSERT, UPDATE, DELETE,
-- TRUNCATE, or any DDL. staybooking_front reads; only cms-dash writes.
--
-- Replace 'CHANGE_ME_STRONG_PASSWORD' with your own value before running,
-- then build the connection string for .env.local:
--   postgresql://staybooking_readonly:<YOUR_PASSWORD>@<host>-pooler.<region>.aws.neon.tech/<dbname>?sslmode=require
-- (Use the pooled hostname; copy the host/db name from your Neon dashboard.)
-- ============================================================================

-- 1. The role. LOGIN + password. NOLOGIN superusers/createrole/createdb stay
--    untouched; this is a plain login role with no special attributes.
CREATE ROLE staybooking_readonly
  LOGIN
  PASSWORD 'CHANGE_ME_STRONG_PASSWORD';

-- 2. Connect to the database. Replace "neondb" if your database is named
--    differently (it is in the DATABASE_URI cms-dash already uses).
GRANT CONNECT ON DATABASE neondb TO staybooking_readonly;

-- 3. Use the schema.
GRANT USAGE ON SCHEMA public TO staybooking_readonly;

-- 4. Read every table that exists today.
GRANT SELECT ON ALL TABLES IN SCHEMA public TO staybooking_readonly;

-- 5. Auto-grant SELECT on tables created in the future, so the next Payload
--    migration in cms-dash doesn't silently break reads. This only affects
--    objects created BY THE ROLE THAT RUNS THIS STATEMENT (your admin role),
--    which is exactly who runs Payload migrations.
ALTER DEFAULT PRIVILEGES FOR ROLE <ADMIN_ROLE_NAME> IN SCHEMA public
  GRANT SELECT ON TABLES TO staybooking_readonly;

-- 6. Sequences are never read by SELECT-only queries (only by INSERTs), so
--    they are deliberately NOT granted. Same for the public schema's
--    CREATE/any DDL privileges. Do not add them.

-- ============================================================================
-- Verification (optional, run right after in the same editor):
--   SET ROLE staybooking_readonly;
--   SELECT count(*) FROM stays;                -- works
--   INSERT INTO locations (label, slug, generate_slug)
--     VALUES ('nope', 'nope', false);          -- must FAIL with
--                                              -- "permission denied for table locations"
--   RESET ROLE;
-- If the INSERT succeeds, STOP and re-check the grants above.
-- ============================================================================

-- If you need to start over:
--   DROP ROLE IF EXISTS ... must first terminate its sessions; typically:
--   REASSIGN OWNED BY staybooking_readonly TO <ADMIN_ROLE_NAME>;
--   DROP OWNED BY staybooking_readonly;
--   DROP ROLE staybooking_readonly;
