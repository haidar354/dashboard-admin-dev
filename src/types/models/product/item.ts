import type { ItemImage } from '@/types/models/product/item-image'
import type { ModifierGroup } from '@/types/models/product/item-modifier/modifier-group'
import type { Unit } from '@/types/models/product/unit/unit'

// ===============================
// Shared Enums / Types
// ===============================

export type ItemKind = 'material' | 'product' | 'service' | 'bundle'
export type MaterialType = 'raw' | 'semi' | 'finished' | 'consumable'

export type SaleFulfillmentMode = 'RECIPE' | 'FINISHED_STOCK' | 'EITHER' | 'NONE'
export type ManufacturingSource = 'IN_HOUSE' | 'PURCHASED' | 'EITHER' | 'NONE'
export type SourcingSitePolicy = 'CENTRAL_ONLY' | 'OUTLET_ONLY' | 'EITHER' | 'NONE'
export type RecipePolicy =
  | 'NONE'
  | 'ITEM_BOM_ONLY'
  | 'SKU_BOM_ONLY'
  | 'ITEM_BOM_WITH_SKU_OVERRIDES'

// ===============================
// ItemView
// ===============================
export interface Item {
  itemId: string
  companyId: string
  businessUnitId: string
  itemCategoryId: string | null
  name: string
  description?: string | null
  kind: ItemKind
  materialType?: MaterialType | null

  hasVariant: boolean
  hasModifier: boolean
  useSameConfig: boolean

  // === Default Global Config (mirror of DB) ===
  saleable: boolean
  showInPos: boolean
  favorite: boolean
  manageStock: boolean
  allowNegativeStock: boolean
  minStockAlert: number | null
  maxStockAlert: number | null

  saleFulfillmentMode: SaleFulfillmentMode
  manufacturingSource: ManufacturingSource
  sourcingSitePolicy: SourcingSitePolicy
  centralKitchenOutletId: string | null
  centralKitchenOutlet?: Outlet | null
  batchSize: number | null
  leadTimeDays: number | null
  recipePolicy: RecipePolicy

  isActive: boolean
  meta?: Record<string, any>

  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string

  // ===== Relations =====
  category?: ItemCategory | null
  itemOutlets?: ItemOutlet[]
  image?: ItemImage
  images?: ItemImage[]
  defaultUnit?: ItemUnitView | null
  itemUnits?: ItemUnitView[]
  variants?: ItemVariantView[]
  sku?: ItemSkuView | null
  skus?: ItemSkuView[]
  variantUnitsCount?: number | null
  skusCount?: number | null
  modifiers?: ItemModifierGroup[]
  boms?: ItemBom[]
}

// ===============================
// Sub-entities (unchanged except for shared types)
// ===============================

export interface ItemCategory {
  itemCategoryId: string
  name: string
}

export interface Outlet {
  outletId: string
  code: string
  name: string
}

export interface ItemOutlet {
  itemOutletId: string
  outletId: string
  itemId: string
  isActive: boolean
  outlet?: Outlet | null
  itemSkuOverride?: ItemSkuOverrideView | null
}

export interface ItemModifierGroup {
  itemModifierGroupId: string
  itemId: string
  isRequired: boolean
  isActive: boolean
  modifierGroupId: string
  sortOrder: number

  group?: ModifierGroup | null
}

export interface ItemUnitView {
  itemUnitId: string
  itemId: string
  unitId: string
  conversion: number
  isBase: boolean
  isStock: boolean
  isSales: boolean
  isPurchase: boolean
  isTransfer: boolean
  minSalesQty?: number
  unit?: Unit

}

export interface ItemVariantView {
  itemVariantId: string
  itemId: string
  optionsKey: string
  options: Record<string, string>[] // [{ axis: "Rasa", value: "Pedas" }]
  displayName: string
  sortOrder: number
  isActive: boolean
  variantUnits?: ItemVariantUnit[]
}

export interface ItemVariantUnit {
  itemVariantUnitId: string
  itemVariantId: string
  itemUnitId: string
  displayName: string
  isActive: boolean

  itemUnit?: ItemUnitView | null
}

export interface ItemBom {
  itemBomId: string
  itemId: string
  yield: number
  isActive: boolean
  lines?: any[]
}

export interface ItemSkuView {
  itemSkuId: string
  itemId: string
  itemUnitId: string | null
  itemVariantUnitId: string | null
  displayName: string
  code?: string
  barcode?: string
  isActive: boolean

  saleable: boolean
  showInPos: boolean
  favorite: boolean
  manageStock: boolean
  allowNegativeStock: boolean
  minStockAlert: number | null
  maxStockAlert: number | null

  saleFulfillmentMode: SaleFulfillmentMode
  manufacturingSource: ManufacturingSource
  sourcingSitePolicy: SourcingSitePolicy
  centralKitchenOutletId: string | null
  centralKitchenOutlet?: Outlet | null
  batchSize: number | null
  leadTimeDays: number | null
  recipePolicy: RecipePolicy

  cost?: ItemSkuCost
  costs?: ItemSkuCost[]
  price?: ItemSkuPrice
  prices?: ItemSkuPrice[]
  skuBoms?: ItemSkuBomView[]
  overrides?: ItemSkuOverrideView[]
  override?: ItemSkuOverrideView | null

  item?: Item | null
  variantUnit?: ItemVariantUnit | null
  itemUnit?: ItemUnitView | null
}

export interface ItemSkuOverrideView {
  itemSkuOverrideId: string
  itemSkuId: string
  outletId: string
  itemOutletId: string | null
  isActive: boolean
  notes?: string | null

  // === Config override (flattened)
  saleable: boolean
  showInPos: boolean
  favorite: boolean
  manageStock: boolean
  allowNegativeStock: boolean
  minStockAlert: number | null
  maxStockAlert: number | null

  saleFulfillmentMode: SaleFulfillmentMode
  manufacturingSource: ManufacturingSource
  sourcingSitePolicy: SourcingSitePolicy
  centralKitchenOutletId: string | null
  centralKitchenOutlet?: Outlet | null
  batchSize: number | null
  leadTimeDays: number | null
  recipePolicy: RecipePolicy

  cost?: ItemSkuCost | null
  price?: ItemSkuPrice | null
  bom?: ItemSkuBomView | null
}

// ===============================
// Sub tables (Cost, Price, BOM, Override)
// ===============================

export interface ItemSkuCost {
  itemSkuCostId: string
  cost: number
  lastCost: number
  method: 'STD' | 'MAVG' | 'FIFO'
}

export interface ItemSkuPrice {
  itemSkuPriceId: string
  currency: string
  taxInclusive: boolean
  price: number
  qtyThreshold: number
  priority: number
  effectiveFrom: string
  effectiveTo?: string | null
}

export interface ItemSkuBomView {
  itemSkuBomId: string
  yield: number
  isActive: boolean
  lines?: ItemSkuBomLine[]
}

export interface ItemSkuBomLine {
  itemSkuBomLineId: string
  materialItemSkuId: string
  quantity: number
  wastePct: number
  consumeFromStock: boolean
  sortOrder: number
}
