/**
 * Read-only Drizzle schema for staybooking_front.
 *
 * This mirrors the ACTUAL tables Payload's Postgres adapter created in Neon
 * (see cms-dash/src/migrations/20260926_130357.ts), NOT the illustrative
 * schema in AGENTS.md §4. Payload is the source of truth — if cms-dash runs
 * a new migration that touches these tables, keep this file in sync.
 *
 * Only the tables the marketplace READS are declared here. Payload-internal
 * tables (payload_kv, payload_migrations, payload_preferences, users, …)
 * are intentionally omitted — the read-only DB role can see them but the
 * frontend never needs them.
 */
import { integer, numeric, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

/** Lookup table — labels/slug options for the "Location" filter. */
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  label: varchar("label").notNull(),
  slug: varchar("slug").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }),
});

/** Lookup table — "1 BHK" / "2 BHK" / … options for the "Property type" filter. */
export const propertyTypes = pgTable("property_types", {
  id: serial("id").primaryKey(),
  label: varchar("label").notNull(),
  slug: varchar("slug").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }),
});

/** Lookup table — "short" / "medium" / "long" chips for the "Stay type" filter. */
export const stayTypes = pgTable("stay_types", {
  id: serial("id").primaryKey(),
  label: varchar("label").notNull(),
  slug: varchar("slug").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }),
});

/** Lookup table — amenity options for the filter checkboxes and card icon row. */
export const amenities = pgTable("amenities", {
  id: serial("id").primaryKey(),
  label: varchar("label").notNull(),
  slug: varchar("slug").notNull(),
  /** Icon KEY the frontend maps to an icon component (e.g. "ac", "pool"). */
  icon: varchar("icon"),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }),
});

/**
 * The listings table. Payload models a `hasMany` relationship ("amenities")
 * and an `array` field ("imageUrls") as child tables keyed by parent id —
 * see stays_rels and stays_image_urls below.
 */
export const stays = pgTable("stays", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  /** Per-night price. numeric in Postgres → returned as string by pg drivers. */
  price: numeric("price").notNull(),
  propertyTypeId: integer("property_type_id").notNull(),
  stayTypeId: integer("stay_type_id").notNull(),
  locationId: integer("location_id").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }),
});

/**
 * Payload's storage for the Stays "imageUrls" array field: one row per URL,
 * ordered by `_order` (not a native Postgres array column like AGENTS.md
 * sketched). `_parent_id` → stays.id (ON DELETE cascade).
 */
export const staysImageUrls = pgTable("stays_image_urls", {
  order: integer("_order").notNull(),
  parentId: integer("_parent_id").notNull(),
  id: varchar("id").primaryKey(),
  url: varchar("url").notNull(),
});

/**
 * Payload's storage for the Stays "amenities" hasMany relationship: the
 * generic has-many join table with a `path` discriminator (always "amenities"
 * for this collection) instead of the simple stay_amenities join table
 * AGENTS.md sketched. `parent_id` → stays.id, `amenities_id` → amenities.id.
 */
export const staysRels = pgTable("stays_rels", {
  id: serial("id").primaryKey(),
  order: integer("order"),
  parentId: integer("parent_id").notNull(),
  path: varchar("path").notNull(),
  amenitiesId: integer("amenities_id"),
});
