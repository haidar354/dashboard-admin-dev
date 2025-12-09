export const allowedFields = [
  'itemId',
  'name',
] as const

export const allowedIncludes = [
  'item',
  'item.itemCategory',
  'item.defaultItemUnit.unit',
  'item.itemUnits.unit',
] as const

export const allowedSorts = [
  'name',
  'createdAt',
  'updatedAt',
  'outlet.name',
  'itemCategory.name',
  'defaultUnit.unit.name',
] as const
