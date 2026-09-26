"use client";

import Image from "next/image";
import { MapPin, Snowflake, Waves } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Amenity, Property } from "@/lib/data";

const AMENITY_ICONS: Record<Amenity, { icon: typeof Snowflake; label: string }> =
  {
    ac: { icon: Snowflake, label: "Air conditioning" },
    pool: { icon: Waves, label: "Pool" },
  };

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Card className="group gap-0 overflow-hidden p-0 py-0 transition-all hover:shadow-lg hover:-translate-y-0.5">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          fill
          src={property.image}
          alt={property.title}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge className="absolute top-3 left-3 bg-background/90 text-foreground shadow-sm backdrop-blur">
          {property.propertyType}
        </Badge>
        <Badge className="absolute top-3 right-3 bg-primary/90 text-primary-foreground shadow-sm backdrop-blur">
          {property.type} stay
        </Badge>
      </div>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{property.title}</h3>
          <p className="shrink-0 text-sm">
            <span className="text-base font-bold text-primary">
              ${property.price}
            </span>
            <span className="text-muted-foreground"> /night</span>
          </p>
        </div>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          {property.state}
        </p>
        <div className="flex items-center gap-2 border-t pt-3">
          {property.amenities.map((amenity) => {
            const { icon: Icon, label } = AMENITY_ICONS[amenity];
            return (
              <span
                key={amenity}
                title={label}
                className="flex size-8 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground"
              >
                <Icon className="size-4" />
              </span>
            );
          })}
          {property.amenities.length === 0 && (
            <span className="text-xs text-muted-foreground">
              No amenities
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
