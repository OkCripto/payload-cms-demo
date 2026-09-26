/**
 * Shared UI types + helpers for the filter components. Kept framework-free
 * so both server (page) and client components can import it.
 */
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

/** Filter state, mirroring the previous shape but with DB-driven string values. */
export interface Filters {
  price: [number, number];
  stayTypes: string[];
  amenities: string[];
  propertyTypes: string[];
  locations: string[];
}

export function defaultFilters(priceBounds: [number, number]): Filters {
  return {
    price: [priceBounds[0], priceBounds[1]],
    stayTypes: [],
    amenities: [],
    propertyTypes: [],
    locations: [],
  };
}

/** URL search-params keys used to persist filter state. */
type ParamKey = "price" | "stay" | "amenity" | "type" | "loc";

const PARAM_BY_FIELD: Record<keyof Omit<Filters, "price">, ParamKey> = {
  stayTypes: "stay",
  amenities: "amenity",
  propertyTypes: "type",
  locations: "loc",
};

/** Serialize filters into URL search params (for router.replace sharing). */
export function encodeFilters(filters: Filters, priceBounds: [number, number]): URLSearchParams {
  const params = new URLSearchParams();
  const [defaultMin, defaultMax] = priceBounds;
  if (filters.price[0] !== defaultMin || filters.price[1] !== defaultMax) {
    params.set("price", `${filters.price[0]}-${filters.price[1]}`);
  }
  for (const [field, key] of Object.entries(PARAM_BY_FIELD) as [keyof Omit<Filters, "price">, ParamKey][]) {
    if (filters[field].length > 0) {
      params.set(key, filters[field].join(","));
    }
  }
  return params;
}

/** Parse filters back out of URL search params, clamped to the given bounds. */
export function parseFilters(
  searchParams: Record<string, string | string[] | undefined>,
  priceBounds: [number, number],
): Filters {
  const filters = defaultFilters(priceBounds);
  const readList = (key: ParamKey): string[] => {
    const raw = searchParams[key];
    if (typeof raw !== "string" || raw.length === 0) return [];
    return raw.split(",").filter(Boolean);
  };

  const priceRaw = typeof searchParams.price === "string" ? searchParams.price : undefined;
  if (priceRaw) {
    const [min, max] = priceRaw.split("-").map((v) => Number(v));
    if (Number.isFinite(min) && Number.isFinite(max)) {
      filters.price = [
        Math.min(Math.max(min, priceBounds[0]), priceBounds[1]),
        Math.min(Math.max(max, priceBounds[0]), priceBounds[1]),
      ];
    }
  }
  filters.stayTypes = readList("stay");
  filters.amenities = readList("amenity");
  filters.propertyTypes = readList("type");
  filters.locations = readList("loc");
  return filters;
}

/** Look up a display label for a slug, falling back to the slug itself. */
export function slugLabel(options: FilterOption[], slug: string): string {
  return options.find((option) => option.value === slug)?.label ?? slug;
}
