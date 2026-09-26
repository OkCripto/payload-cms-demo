import type { CollectionConfig } from 'payload'

export const Stays: CollectionConfig = {
  slug: 'stays',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'price', 'propertyType', 'stayType', 'location', 'createdAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      // Stored as numeric (per night) in Postgres.
      name: 'price',
      type: 'number',
      required: true,
    },
    {
      // Plain URL strings — NO upload/media field. Images live outside the DB.
      name: 'imageUrls',
      type: 'array',
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'propertyType',
      type: 'relationship',
      relationTo: 'property-types',
      required: true,
    },
    {
      name: 'stayType',
      type: 'relationship',
      relationTo: 'stay-types',
      required: true,
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'locations',
      required: true,
    },
    {
      // Has-many relationship → Payload creates the stay_amenities join table
      // (stay_id + amenity_id) automatically in Postgres.
      name: 'amenities',
      hasMany: true,
      type: 'relationship',
      relationTo: 'amenities',
    },
  ],
}
