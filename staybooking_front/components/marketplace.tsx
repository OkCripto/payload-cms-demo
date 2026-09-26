"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { FiltersSidebar } from "@/components/filters-sidebar";
import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FilterOptions, StayCard } from "@/lib/queries";
import {
  defaultFilters,
  encodeFilters,
  type Filters,
} from "@/lib/stays-ui";

interface MarketplaceProps {
  /** Filter option lists straight from the DB lookup tables. */
  options: FilterOptions;
  /** Full unfiltered list of stays (server-fetched, read-only). */
  stays: StayCard[];
  /** Slider bounds derived from the DB. */
  priceBounds: [number, number];
  /** Initial filter state decoded from the URL by the server. */
  initialFilters: Filters;
}

/**
 * Client shell for the marketplace page. All stays come from the server; this
 * component only owns filter state, syncing it to the URL search params with
 * router.replace so any filtered view can be shared or bookmarked.
 *
 * Markup mirrors the previous app/page.tsx (header, sidebar, results grid).
 */
export function Marketplace({ options, stays, priceBounds, initialFilters }: MarketplaceProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [query, setQuery] = useState("");

  const applyFilters = (next: Filters) => {
    setFilters(next);
    const params = encodeFilters(next, priceBounds);
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stays.filter((stay) => {
      if (q && !`${stay.title} ${stay.location}`.toLowerCase().includes(q)) {
        return false;
      }
      if (stay.price < filters.price[0] || stay.price > filters.price[1]) {
        return false;
      }
      if (filters.stayTypes.length > 0 && !filters.stayTypes.includes(stay.stayType)) {
        return false;
      }
      if (
        filters.amenities.length > 0 &&
        !filters.amenities.every((a) => stay.amenitySlugs.includes(a))
      ) {
        return false;
      }
      if (
        filters.propertyTypes.length > 0 &&
        !filters.propertyTypes.includes(stay.propertyTypeSlug)
      ) {
        return false;
      }
      if (filters.locations.length > 0 && !filters.locations.includes(stay.locationSlug)) {
        return false;
      }
      return true;
    });
  }, [query, filters, stays]);

  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      {/* Header with search bar */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-4">
          <span className="text-lg font-bold tracking-tight">
            Stay<span className="text-primary">Booking</span>
          </span>
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or location…"
              className="pl-9"
            />
          </div>
        </div>
      </header>

      {/* Sidebar + listing grid */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6">
        {/* Left: filters */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-[81px] rounded-xl border bg-card p-5">
            <FiltersSidebar
              options={options}
              priceBounds={priceBounds}
              filters={filters}
              onChange={applyFilters}
            />
          </div>
        </aside>

        {/* Right: main listing section */}
        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "stay" : "stays"} found
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyFilters(defaultFilters(priceBounds))}
              className="lg:hidden"
            >
              Filters
              {filters.stayTypes.length +
                filters.amenities.length +
                filters.propertyTypes.length +
                filters.locations.length >
                0 &&
                ` (${filters.stayTypes.length + filters.amenities.length + filters.propertyTypes.length + filters.locations.length})`}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((stay) => (
              <PropertyCard
                key={stay.id}
                stay={stay}
                amenityLabels={options.amenities}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
              <Search className="mb-3 size-8 text-muted-foreground" />
              <h3 className="font-semibold">No stays match your search</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search term.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
