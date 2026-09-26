/**
 * Data-fetching layer for the marketplace. All functions are SELECT-only and
 * run through the read-only Drizzle client (lib/db).
 *
 * The options the filters sidebar shows (locations, property types, stay
 * types, amenities) come straight from the lookup tables, so any value an
 * admin adds in cms-dash shows up here with no code change.
 */
import { and, asc, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";

import { getReadOnlyDb } from "@/lib/db";
import {
  amenities,
  locations,
  propertyTypes,
  stayTypes,
  stays,
  staysImageUrls,
  staysRels,
} from "@/lib/db/schema";

/** Generic { value, label } option shape used by the filters sidebar. */
export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterOptions {
  locations: FilterOption[];
  propertyTypes: FilterOption[];
  stayTypes: FilterOption[];
  amenities: FilterOption[];
}

/** What each marketplace card needs. */
export interface StayCard {
  id: number;
  title: string;
  /** Cover image URL (first of the stay's image_urls, if any). */
  image: string | null;
  /** Per-night price as a number (numeric column comes back as string). */
  price: number;
  /** Location label, e.g. "Bangalore". */
  location: string;
  /** Location slug, e.g. "bangalore" — matches the filter option values. */
  locationSlug: string;
  /** Property-type label, e.g. "2 BHK". */
  propertyType: string;
  /** Property-type slug, e.g. "2-bhk" — matches the filter option values. */
  propertyTypeSlug: string;
  /** Stay-type slug, e.g. "short" | "medium" | "long". */
  stayType: string;
  /** Amenity slugs for the icon row, e.g. ["ac", "pool"]. */
  amenitySlugs: string[];
}

/** Filter params mirroring the UI's Filters shape (lib/stays-ui.ts). */
export interface StaysFilterParams {
  price?: [number, number];
  stayTypes?: string[];
  amenities?: string[];
  propertyTypes?: string[];
  locations?: string[];
}

/**
 * Fetch every filter option list from the lookup tables. Cheap (a handful of
 * rows each) and always reflects current DB state.
 */
export async function getFilterOptions(): Promise<FilterOptions> {
  const db = getReadOnlyDb();
  const [locationRows, propertyTypeRows, stayTypeRows, amenityRows] = await Promise.all([
    db
      .select({ value: locations.slug, label: locations.label })
      .from(locations)
      .orderBy(asc(locations.label)),
    db
      .select({ value: propertyTypes.slug, label: propertyTypes.label })
      .from(propertyTypes)
      .orderBy(asc(propertyTypes.label)),
    db
      .select({ value: stayTypes.slug, label: stayTypes.label })
      .from(stayTypes)
      .orderBy(asc(stayTypes.label)),
    db
      .select({ value: amenities.slug, label: amenities.label })
      .from(amenities)
      .orderBy(asc(amenities.label)),
  ]);

  return {
    locations: locationRows,
    propertyTypes: propertyTypeRows,
    stayTypes: stayTypeRows,
    amenities: amenityRows,
  };
}

/** Cheapest and priciest per-night price across all stays, for slider bounds. */
export async function getPriceBounds(): Promise<[number, number]> {
  const db = getReadOnlyDb();
  const [row] = await db
    .select({
      min: sql<string | null>`min(${stays.price})`,
      max: sql<string | null>`max(${stays.price})`,
    })
    .from(stays);

  const min = row?.min != null ? Math.floor(Number(row.min)) : 0;
  const max = row?.max != null ? Math.ceil(Number(row.max)) : 1000;
  // Keep a little headroom so the upper handle can actually reach the max.
  return [min, Math.max(max, min + 10)];
}

/**
 * Postgres text-array literal ("{ac,pool}") → string[]. Some transports
 * serialize arrays as their text form; the neon-http JSON payload usually
 * keeps them as real arrays. Handle both so the card icon row always works.
 */
function toSlugArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  if (typeof value === "string") {
    return value
      .replace(/^\{\}?$/, "")
      .replace(/^\{|\}$/g, "")
      .split(",")
      .filter(Boolean);
  }
  return [];
}

/**
 * The stays listing query. One grouped round-trip: stays joined to their
 * lookup rows, amenity slugs aggregated from stays_rels, cover image from
 * stays_image_urls, all filtered by the params the UI hands over.
 */
export async function getStays(params: StaysFilterParams = {}): Promise<StayCard[]> {
  const db = getReadOnlyDb();

  const conditions: SQL[] = [];
  if (params.price) {
    const [minPrice, maxPrice] = params.price;
    conditions.push(gte(stays.price, String(minPrice)));
    conditions.push(lte(stays.price, String(maxPrice)));
  }
  if (params.stayTypes?.length) {
    conditions.push(inArray(stayTypes.slug, params.stayTypes));
  }
  if (params.propertyTypes?.length) {
    conditions.push(inArray(propertyTypes.slug, params.propertyTypes));
  }
  if (params.locations?.length) {
    conditions.push(inArray(locations.slug, params.locations));
  }
  // Amenities: the stay must have EVERY selected amenity (AND semantics,
  // matching the previous client-side `.every()` behavior).
  if (params.amenities?.length) {
    conditions.push(
      sql`${stays.id} in (
        select sr.parent_id
        from ${staysRels} sr
        join ${amenities} a on a.id = sr.amenities_id
        where sr.path = 'amenities' and a.slug in ${params.amenities}
        group by sr.parent_id
        having count(distinct a.slug) = ${params.amenities.length}
      )`,
    );
  }

  const rows = await db
    .select({
      id: stays.id,
      title: stays.title,
      price: stays.price,
      location: locations.label,
      locationSlug: locations.slug,
      propertyType: propertyTypes.label,
      propertyTypeSlug: propertyTypes.slug,
      stayType: stayTypes.slug,
      image: sql<string | null>`(
        select siu.url
        from ${staysImageUrls} siu
        where siu._parent_id = ${stays.id}
        order by siu._order asc
        limit 1
      )`,
      amenitySlugs: sql<string[]>`coalesce((
        select array_agg(a.slug order by sr."order" asc)
        from ${staysRels} sr
        join ${amenities} a on a.id = sr.amenities_id
        where sr.parent_id = ${stays.id} and sr.path = 'amenities'
      ), '{}')`,
    })
    .from(stays)
    .innerJoin(locations, eq(stays.locationId, locations.id))
    .innerJoin(propertyTypes, eq(stays.propertyTypeId, propertyTypes.id))
    .innerJoin(stayTypes, eq(stays.stayTypeId, stayTypes.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(stays.id));

  return rows.map((row) => ({
    ...row,
    price: Number(row.price),
    amenitySlugs: toSlugArray(row.amenitySlugs),
  }));
}
