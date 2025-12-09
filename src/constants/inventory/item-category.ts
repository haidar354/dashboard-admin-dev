export const allowedFields = [
  'itemCategoryId',
  'name',
  'description',
  'isActive',
  'itemsCount',
  'createdAt',
  'updatedAt',
] as const

export const allowedIncludes = [
  'businessUnit',
  'items',
  'itemsCount',
] as const

export const allowedSorts = [
  'name',
  'description',
  'itemsCount',
  'createdAt',
  'updatedAt',
] as const
