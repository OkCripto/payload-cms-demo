import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'slug', 'createdAt'],
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    slugField({ useAsSlug: 'label' }),
  ],
}
