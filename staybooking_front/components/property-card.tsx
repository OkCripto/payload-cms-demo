"use client";

import Image from "next/image";
import { MapPin, Snowflake, Waves } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { FilterOption, StayCard } from "@/lib/queries";

/** Icon per amenity slug. Extend this map as new amenities are added in the CMS. */
const AMENITY_ICONS: Record<string, { icon: typeof Snowflake; label: string }> = {
  ac: { icon: Snowflake, label: "Air conditioning" },
  pool: { icon: Waves, label: "Pool" },
};

const FALLBACK_ICON = Snowflake;

interface PropertyCardProps {
  stay: StayCard;
  /** Amenity options from the DB, for icon-title labels. */
  amenityLabels: FilterOption[];
}

export function PropertyCard({ stay, amenityLabels }: PropertyCardProps) {
  return (
    <Card className="group gap-0 overflow-hidden p-0 py-0 transition-all hover:shadow-lg hover:-translate-y-0.5">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {stay.image && (
          <Image
            fill
            src={stay.image}
            alt={stay.title}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <Badge className="absolute top-3 left-3 bg-background/90 text-foreground shadow-sm backdrop-blur">
          {stay.propertyType}
        </Badge>
        <Badge className="absolute top-3 right-3 bg-primary/90 text-primary-foreground shadow-sm backdrop-blur">
          {stay.stayType} stay
        </Badge>
      </div>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{stay.title}</h3>
          <p className="shrink-0 text-sm">
            <span className="text-base font-bold text-primary">${stay.price}</span>
            <span className="text-muted-foreground"> /night</span>
          </p>
        </div>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          {stay.location}
        </p>
        <div className="flex items-center gap-2 border-t pt-3">
          {stay.amenitySlugs.map((slug) => {
            const mapped = AMENITY_ICONS[slug] ?? {
              icon: FALLBACK_ICON,
              label: amenityLabels.find((a) => a.value === slug)?.label ?? slug,
            };
            const { icon: Icon, label } = mapped;
            return (
              <span
                key={slug}
                title={label}
                className="flex size-8 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground"
              >
                <Icon className="size-4" />
              </span>
            );
          })}
          {stay.amenitySlugs.length === 0 && (
            <span className="text-xs text-muted-foreground">No amenities</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
