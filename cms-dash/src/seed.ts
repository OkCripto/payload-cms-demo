/**
 * Seed script — inserts the default lookup rows from AGENTS.md §5 and a couple
 * of sample stays that reference those rows by FK (never by copied strings).
 *
 * Run with: npm run seed   (payload run src/seed.ts)
 * Idempotent: existing rows (matched by slug) are skipped, stays are only
 * created when no stays exist yet.
 */
import { getPayload } from 'payload'

import config from '../payload.config'

type LookupRow = {
  slug: string
  label: string
  icon?: string
}

const LOCATIONS: LookupRow[] = [
  { label: 'Delhi', slug: 'delhi' },
  { label: 'Mumbai', slug: 'mumbai' },
  { label: 'Bangalore', slug: 'bangalore' },
  { label: 'Pune', slug: 'pune' },
  { label: 'Kolkata', slug: 'kolkata' },
]

const PROPERTY_TYPES: LookupRow[] = [
  { label: '2 BHK', slug: '2-bhk' },
  { label: '3 BHK', slug: '3-bhk' },
  { label: '4 BHK', slug: '4-bhk' },
]

const AMENITIES: LookupRow[] = [
  { label: 'AC', slug: 'ac', icon: 'ac' },
  { label: 'Pool', slug: 'pool', icon: 'pool' },
]

const STAY_TYPES: LookupRow[] = [
  { label: 'Long', slug: 'long' },
  { label: 'Short', slug: 'short' },
  { label: 'Medium', slug: 'medium' },
]

const SAMPLE_STAYS = [
  {
    title: 'Seaside Serenity Villa',
    price: 850,
    imageUrls: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200'],
    propertyTypeSlug: '2-bhk',
    stayTypeSlug: 'long',
    locationSlug: 'bangalore',
    amenitySlugs: ['ac', 'pool'],
  },
  {
    title: 'Urban Loft Near Cyber Hub',
    price: 120,
    imageUrls: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
    ],
    propertyTypeSlug: '3-bhk',
    stayTypeSlug: 'short',
    locationSlug: 'delhi',
    amenitySlugs: ['ac'],
  },
  {
    title: 'Pune Garden Retreat',
    price: 340,
    imageUrls: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200'],
    propertyTypeSlug: '4-bhk',
    stayTypeSlug: 'medium',
    locationSlug: 'pune',
    amenitySlugs: ['pool'],
  },
]

async function seedCollection(
  payload: ReturnType<typeof getPayload> extends Promise<infer T> ? T : never,
  collectionSlug: string,
  rows: LookupRow[],
) {
  const existing = await payload.find({
    collection: collectionSlug,
    limit: 1000,
    depth: 0,
  })
  const existingSlugs = new Set(existing.docs.map((doc) => doc.slug))

  for (const row of rows) {
    if (existingSlugs.has(row.slug)) {
      console.log(`  = ${collectionSlug}/${row.slug} already exists, skipping`)
      continue
    }
    const { icon, ...data } = row
    const doc = await payload.create({
      collection: collectionSlug,
      data: icon !== undefined ? { ...data, icon } : data,
      depth: 0,
    })
    console.log(`  + ${collectionSlug}/${row.slug} (id=${doc.id})`)
  }
}

async function findBySlug(
  payload: ReturnType<typeof getPayload> extends Promise<infer T> ? T : never,
  collectionSlug: string,
  slug: string,
) {
  const res = await payload.find({
    collection: collectionSlug,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return res.docs[0]
}

export default async function seed() {
  const payload = await getPayload({ config })

  console.log('Seeding lookup tables…')
  await seedCollection(payload, 'locations', LOCATIONS)
  await seedCollection(payload, 'property-types', PROPERTY_TYPES)
  await seedCollection(payload, 'amenities', AMENITIES)
  await seedCollection(payload, 'stay-types', STAY_TYPES)

  // Resolve all FK targets by slug, so sample stays never copy label strings.
  const [twoBhk, threeBhk, fourBhk] = await Promise.all([
    findBySlug(payload, 'property-types', '2-bhk'),
    findBySlug(payload, 'property-types', '3-bhk'),
    findBySlug(payload, 'property-types', '4-bhk'),
  ])
  const [longStay, shortStay, mediumStay] = await Promise.all([
    findBySlug(payload, 'stay-types', 'long'),
    findBySlug(payload, 'stay-types', 'short'),
    findBySlug(payload, 'stay-types', 'medium'),
  ])
  const [delhi, bangalore, pune] = await Promise.all([
    findBySlug(payload, 'locations', 'delhi'),
    findBySlug(payload, 'locations', 'bangalore'),
    findBySlug(payload, 'locations', 'pune'),
  ])
  const [ac, pool] = await Promise.all([
    findBySlug(payload, 'amenities', 'ac'),
    findBySlug(payload, 'amenities', 'pool'),
  ])

  for (const fk of [twoBhk, threeBhk, fourBhk, longStay, shortStay, mediumStay, delhi, bangalore, pune, ac, pool]) {
    if (!fk) {
      throw new Error('Missing a lookup row needed for sample stays — seed aborted.')
    }
  }

  console.log('Seeding sample stays…')
  const existingStays = await payload.find({ collection: 'stays', limit: 1, depth: 0 })
  if (existingStays.docs.length > 0) {
    console.log('  = stays already exist, skipping sample-stay creation')
    return
  }

  for (const stay of SAMPLE_STAYS) {
    const propertyType =
      stay.propertyTypeSlug === '2-bhk'
        ? twoBhk
        : stay.propertyTypeSlug === '3-bhk'
          ? threeBhk
          : fourBhk
    const stayType =
      stay.stayTypeSlug === 'long'
        ? longStay
        : stay.stayTypeSlug === 'short'
          ? shortStay
          : mediumStay
    const location =
      stay.locationSlug === 'delhi' ? delhi : stay.locationSlug === 'bangalore' ? bangalore : pune

    const amenities = stay.amenitySlugs
      .map((slug) => (slug === 'ac' ? ac : pool))
      .filter(Boolean)
      .map((doc) => doc!.id)

    const doc = await payload.create({
      collection: 'stays',
      depth: 0,
      data: {
        title: stay.title,
        price: stay.price,
        imageUrls: stay.imageUrls.map((url) => ({ url })),
        propertyType: propertyType!.id, // FK — never a copied label string
        stayType: stayType!.id, // FK — never a copied label string
        location: location!.id, // FK — never a copied label string
        amenities, // FKs into amenities via stays_rels join table
      },
    })
    console.log(`  + stays/${stay.title} (id=${doc.id})`)
  }
}

// Top-level await: `payload run` imports this module and awaits it, then exits.
// The script is idempotent — safe to run repeatedly.
try {
  await seed()
  console.log('Seed complete ✅')
  process.exit(0)
} catch (err) {
  console.error('Seed failed:', err)
  process.exit(1)
}
