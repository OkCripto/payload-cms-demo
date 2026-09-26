import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'

import { Amenities } from './src/collections/Amenities'
import { Locations } from './src/collections/Locations'
import { PropertyTypes } from './src/collections/PropertyTypes'
import { Stays } from './src/collections/Stays'
import { StayTypes } from './src/collections/StayTypes'
import { Users } from './src/collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
  },
  collections: [Users, Locations, PropertyTypes, StayTypes, Amenities, Stays],
  db: postgresAdapter({
    // Neon pooled connection string (hostname contains "-pooler").
    // Payload's Postgres adapter runs on the `pg` driver (raw TCP), which works
    // under Node locally but NOT inside a Cloudflare Worker without Hyperdrive.
    // If a migration ever hits a PgBouncer prepared-statement error, swap in the
    // DIRECT (non-pooler) string, run the migration, then swap back.
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
    push: false, // schema is owned by migrations, never auto-pushed
    migrationDir: path.resolve(dirname, 'src/migrations'),
  }),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || undefined,
  typescript: {
    autoGenerate: false, // we run `payload generate:types` manually in scripts
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },
})
