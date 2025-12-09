import type { Item } from '@/types/models/product/item'
import type { ItemCost } from '@/types/models/product/item-cost'
import type { ItemPrice } from '@/types/models/product/item-price'

export interface ItemVariantGroup {
  'itemVariantGroupId': string
  'parentItemId': string
  'name': string
  'slug': string
  'displayOrder': number
  'createdAt': string
  'updatedAt': string
  options: ItemVariantGroupOption[]
}

export interface ItemVariantGroupOption {
  'itemVariantGroupOptionId': string
  'itemVariantGroupId': string
  'name': string
  'slug': string
  'position': number
  'isActive': boolean
  'createdAt': string
  'updatedAt': string
}

export interface ItemVariant {
  itemVariantId: string
  outletId?: string
  key: string
  slugKey: string
  isDefault: boolean
  isActive: boolean
  childItem?: Item
  parentItem?: Item
  optionValues: ItemVariantOptionValue[]
  itemCost?: ItemCost
  activeItemPrice?: ItemPrice
}

export interface ItemVariantOptionValue {
  itemVariantOptionValueId: string
  itemVariantId: string
  itemVariantGroupId: string
  itemVariantGroupOptionId: string
  createdAt: string
  updatedAt: string
  group?: ItemVariantGroup
  option?: ItemVariantGroupOption
}
