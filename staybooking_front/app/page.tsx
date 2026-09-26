"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { FiltersSidebar, DEFAULT_FILTERS, type Filters } from "@/components/filters-sidebar";
import { PropertyCard } from "@/components/property-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PROPERTIES } from "@/lib/data";

export default function Home() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROPERTIES.filter((p) => {
      if (
        q &&
        !`${p.title} ${p.state}`.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (
        p.price < filters.price[0] ||
        p.price > filters.price[1]
      ) {
        return false;
      }
      if (
        filters.stayTypes.length > 0 &&
        !filters.stayTypes.includes(p.type)
      ) {
        return false;
      }
      if (
        filters.amenities.length > 0 &&
        !filters.amenities.every((a) => p.amenities.includes(a))
      ) {
        return false;
      }
      if (
        filters.propertyTypes.length > 0 &&
        !filters.propertyTypes.includes(p.propertyType)
      ) {
        return false;
      }
      if (
        filters.locations.length > 0 &&
        !filters.locations.some((loc) =>
          p.state.toLowerCase().includes(loc.toLowerCase())
        )
      ) {
        return false;
      }
      return true;
    });
  }, [query, filters]);

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
              placeholder="Search by title or state…"
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
            <FiltersSidebar filters={filters} onChange={setFilters} />
          </div>
        </aside>

        {/* Right: main listing section */}
        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {filtered.length}
              </span>{" "}
              {filtered.length === 1 ? "stay" : "stays"} found
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="lg:hidden"
            >
              <SlidersHorizontal />
              Filters
              {(filters.stayTypes.length +
                filters.amenities.length +
                filters.propertyTypes.length +
                filters.locations.length >
              0) &&
                ` (${filters.stayTypes.length + filters.amenities.length + filters.propertyTypes.length + filters.locations.length})`}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} />
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
