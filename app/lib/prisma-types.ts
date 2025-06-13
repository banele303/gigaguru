// This file contains manually defined types that mirror the Prisma enums
// Use this when you need Prisma types without importing from @prisma/client

export enum ProductStatus {
  draft = 'draft',
  published = 'published',
  archived = 'archived'
}

export enum Category {
  men = 'men',
  women = 'women',
  kids = 'kids',
  sports = 'sports',
  home = 'home',
  beauty = 'beauty',
  jewellery = 'jewellery',
  technology = 'technology',
  brands = 'brands',
  deals = 'deals',
  sale = 'sale'
}

export enum CampaignStatus {
  draft = 'draft',
  scheduled = 'scheduled',
  sending = 'sending',
  sent = 'sent',
  failed = 'failed'
}

export enum RecipientStatus {
  pending = 'pending',
  sent = 'sent',
  failed = 'failed'
}
