import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const Amenities: CollectionConfig = {
  slug: 'amenities',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'slug', 'icon', 'createdAt'],
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    slugField({ useAsSlug: 'label' }),
    {
      // Icon KEY the frontend maps to an icon component — not a binary asset.
      // DB never stores image binaries, only keys/links (AGENTS.md §4).
      name: 'icon',
      type: 'text',
    },
  ],
}
