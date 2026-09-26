export type StayType = "short" | "medium" | "long";
export type Amenity = "ac" | "pool";
export type PropertyType = "1 BHK" | "2 BHK" | "3 BHK";

export interface Property {
  id: number;
  title: string;
  image: string;
  price: number;
  state: string;
  type: StayType;
  amenities: Amenity[];
  propertyType: PropertyType;
}

export const STAY_TYPES: { value: StayType; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

export const AMENITIES: { value: Amenity; label: string }[] = [
  { value: "ac", label: "AC" },
  { value: "pool", label: "Pool" },
];

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "1 BHK", label: "1 BHK" },
  { value: "2 BHK", label: "2 BHK" },
  { value: "3 BHK", label: "3 BHK" },
];

export const PRICE_MIN = 50;
export const PRICE_MAX = 1000;

export const PROPERTIES: Property[] = [
  {
    id: 1,
    title: "Seaside Serenity Villa",
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&auto=format&fit=crop",
    price: 850,
    state: "Goa",
    type: "long",
    amenities: ["ac", "pool"],
    propertyType: "3 BHK",
  },
  {
    id: 2,
    title: "Urban Loft Downtown",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop",
    price: 320,
    state: "Maharashtra",
    type: "short",
    amenities: ["ac"],
    propertyType: "1 BHK",
  },
  {
    id: 3,
    title: "Palm Grove Resort Stay",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80&auto=format&fit=crop",
    price: 640,
    state: "Kerala",
    type: "medium",
    amenities: ["ac", "pool"],
    propertyType: "2 BHK",
  },
  {
    id: 4,
    title: "Mountain View Cottage",
    image:
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80&auto=format&fit=crop",
    price: 180,
    state: "Himachal Pradesh",
    type: "short",
    amenities: ["pool"],
    propertyType: "1 BHK",
  },
  {
    id: 5,
    title: "Golden Dunes Homestay",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80&auto=format&fit=crop",
    price: 240,
    state: "Rajasthan",
    type: "medium",
    amenities: ["ac"],
    propertyType: "2 BHK",
  },
  {
    id: 6,
    title: "Lakeside Retreat Apartment",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80&auto=format&fit=crop",
    price: 410,
    state: "Udaipur, Rajasthan",
    type: "long",
    amenities: ["ac", "pool"],
    propertyType: "3 BHK",
  },
  {
    id: 7,
    title: "Cozy City Studio Suite",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&auto=format&fit=crop",
    price: 95,
    state: "Karnataka",
    type: "short",
    amenities: ["ac"],
    propertyType: "1 BHK",
  },
  {
    id: 8,
    title: "Backwater Bliss Bungalow",
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&auto=format&fit=crop",
    price: 520,
    state: "Kerala",
    type: "long",
    amenities: ["pool"],
    propertyType: "2 BHK",
  },
  {
    id: 9,
    title: "Skyline Penthouse Retreat",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&auto=format&fit=crop",
    price: 990,
    state: "Delhi",
    type: "medium",
    amenities: ["ac", "pool"],
    propertyType: "3 BHK",
  },
];
