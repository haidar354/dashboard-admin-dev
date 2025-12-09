// =======================
// Modifier (root: modifier_groups)
// =======================
export const modifierAllowedFields = [
  'modifierGroupId',
  'name',
  'i18n',
  'code',
  'type',
  'multiple',
  'allowQuantity',
  'minSelect',
  'maxSelect',
  'isActive',
  'createdByUserId',
  'updatedByUserId',
  'createdAt',
  'updatedAt',
] as const

// =======================
// Relations
// =======================

// options
export const modifierOptionAllowedFields = [
  'modifierOptionId',
  'modifierGroupId',
  'name',
  'i18n',
  'priceDelta',
  'quantityScale',
  'isDefault',
  'useComponent',
  'sortOrder',
  'isActive',
  'createdAt',
  'updatedAt',
] as const

// options.components
export const modifierOptionComponentAllowedFields = [
  'modifierOptionComponentId',
  'companyId',
  'businessUnitId',
  'modifierOptionId',
  'componentItemId',
  'componentUnitId',
  'quantityInBase',
  'wastagePercent',
] as const

// options.components.componentItem (embed)
export const modifierComponentItemAllowedFields = [
  'itemId',
  'name',
  'description',
  'materialType',
  'itemCategoryId',
  'manageStock',
  'minStockAlert',
  'isActive',
  'meta',
] as const

// options.components.componentUnit (embed)
export const modifierComponentUnitAllowedFields = [
  'itemUnitId',
  'itemId',
  'name',
  'conversion',
  'isDefault',
  'purchasePrice',
  'minSalesQty',
] as const

// =======================
// Includes & Sorts
// =======================
export const modifierAllowedIncludes = [
  'options',
  'options.components',
  'options.components.componentItem',
  'options.components.componentUnit',
  'options.components.componentUnit.itemSku',
] as const

// whitelist sorts untuk group (selaras dengan backend)
export const modifierAllowedSorts = [
  'name',
  'createdAt',
  'updatedAt',
  'isActive',

  // tambahkan jika backend mengizinkan:
  // 'minSelect', 'maxSelect', 'type'
] as const

// (opsional) helper types
export type ModifierField = typeof modifierAllowedFields[number]
export type ModifierInclude = typeof modifierAllowedIncludes[number]
export type ModifierSort = typeof modifierAllowedSorts[number]
