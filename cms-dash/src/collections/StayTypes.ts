import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const StayTypes: CollectionConfig = {
  slug: 'stay-types',
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
