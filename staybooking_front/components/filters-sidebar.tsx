"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  AMENITIES,
  PRICE_MAX,
  PRICE_MIN,
  PROPERTY_TYPES,
  STAY_TYPES,
  type Amenity,
  type PropertyType,
  type StayType,
} from "@/lib/data";

export interface Filters {
  price: [number, number];
  stayTypes: StayType[];
  amenities: Amenity[];
  propertyTypes: PropertyType[];
}

export const DEFAULT_FILTERS: Filters = {
  price: [PRICE_MIN, PRICE_MAX],
  stayTypes: [],
  amenities: [],
  propertyTypes: [],
};

interface FiltersSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function FiltersSidebar({ filters, onChange }: FiltersSidebarProps) {
  const toggleValue = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw />
          Reset
        </Button>
      </div>

      {/* Price range */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Price range</h3>
        <Slider
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={10}
          value={filters.price}
          onValueChange={(value) =>
            onChange({ ...filters, price: value as [number, number] })
          }
          aria-label="Price range"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="rounded-md border bg-background px-2 py-1 font-medium text-foreground">
            ${filters.price[0]}
          </span>
          <span>to</span>
          <span className="rounded-md border bg-background px-2 py-1 font-medium text-foreground">
            ${filters.price[1]}
          </span>
        </div>
      </section>

      {/* Stay type */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Stay type</h3>
        <div className="flex flex-wrap gap-2">
          {STAY_TYPES.map(({ value, label }) => {
            const selected = filters.stayTypes.includes(value);
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  onChange({
                    ...filters,
                    stayTypes: toggleValue(filters.stayTypes, value),
                  })
                }
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background hover:bg-accent"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Amenities */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Amenities</h3>
        <div className="flex flex-col gap-2.5">
          {AMENITIES.map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2.5 text-sm"
            >
              <Checkbox
                checked={filters.amenities.includes(value)}
                onCheckedChange={() =>
                  onChange({
                    ...filters,
                    amenities: toggleValue(filters.amenities, value),
                  })
                }
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      {/* Property type */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Property type</h3>
        <div className="flex flex-col gap-2.5">
          {PROPERTY_TYPES.map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2.5 text-sm"
            >
              <Checkbox
                checked={filters.propertyTypes.includes(value)}
                onCheckedChange={() =>
                  onChange({
                    ...filters,
                    propertyTypes: toggleValue(filters.propertyTypes, value),
                  })
                }
              />
              {label}
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
