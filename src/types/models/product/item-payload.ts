import type { ItemImage } from '@/types/models/product/item-image'
import type { ModifierGroup } from '@/types/models/product/item-modifier/modifier-group'
import type { Unit } from '@/types/models/product/unit/unit'

/* ===============================
   🔹 Shared Enums / Basic Types
   =============================== */

export type SaleFulfillmentMode = 'RECIPE' | 'FINISHED_STOCK' | 'EITHER' | 'NONE'
export type ManufacturingSource = 'IN_HOUSE' | 'PURCHASED' | 'EITHER' | 'NONE'
export type SourcingSitePolicy = 'CENTRAL_ONLY' | 'OUTLET_ONLY' | 'EITHER' | 'NONE'
export type RecipePolicy =
  | 'NONE'
  | 'ITEM_BOM_ONLY'
  | 'SKU_BOM_ONLY'
  | 'ITEM_BOM_WITH_SKU_OVERRIDES'

export type ItemKind = 'material' | 'product' | 'service' | 'bundle'
export type MaterialType = 'raw' | 'semi' | 'finished' | 'consumable'
export type CostMethod = 'STD' | 'MAVG' | 'FIFO'

/* ===============================
   🔹 Outlet Availability
   =============================== */

export interface OutletPayload {
  itemOutletId?: string
  outletId: string
  isActive?: boolean
  sortOrder?: number | null
  name?: string
}

/* ===============================
   🔹 BOM Definition
   =============================== */

export interface BomLinePayload {
  materialItemSkuId: string
  quantity: number
  wastePct?: number
  consumeFromStock?: boolean
  sortOrder?: number
  notes?: string
}

export interface BomPayload {
  yield?: number
  notes?: string
  lines: BomLinePayload[]
}

/* ===============================
   🔹 Cost & Price
   =============================== */

export interface CostPayload {
  itemSkuCostId?: string
  cost: number
  lastCost?: number | null
  method?: CostMethod | null
}

export interface PricePayload {
  itemSkuPriceId?: string
  price: number
  taxInclusive?: boolean
  qtyThreshold?: number
}

/* ===============================
   🔹 Config (Global or Override)
   =============================== */

export interface ConfigPayload {
  saleable?: boolean
  showInPos?: boolean
  favorite?: boolean

  saleFulfillmentMode?: SaleFulfillmentMode | null
  manufacturingSource?: ManufacturingSource | null
  sourcingSitePolicy?: SourcingSitePolicy | null
  centralKitchenOutletId?: string | null
  batchSize?: number | null
  leadTimeDays?: number | null

  manageStock?: boolean
  allowNegativeStock?: boolean
  minStockAlert?: number | null
  maxStockAlert?: number | null

  recipePolicy?: RecipePolicy | null
}

/* ===============================
   🔹 Override (per outlet)
   =============================== */

export interface OverridePayload {
  itemSkuOverrideId?: string
  outletId: string
  isActive?: boolean
  config?: ConfigPayload
  cost?: CostPayload
  price?: PricePayload
  bom?: BomPayload
}

/* ===============================
   🔹 SKU (variant/unit combination)
   =============================== */

export interface SkuPayload {
  itemSkuId?: string
  tempId: string
  displayName: string
  code: string
  barcode?: string | null
  isActive?: boolean

  itemVariantUnitId?: string | null
  itemUnitId?: string

  variantUnitTempId?: string | null
  unitTempId?: string | null

  config?: ConfigPayload
  cost?: CostPayload
  price?: PricePayload
  bom?: BomPayload | null
  overrides?: OverridePayload[]
}

/* ===============================
   🔹 Units
   =============================== */

export interface UnitPayload {
  itemUnitId?: string
  tempId: string
  unitId: string
  conversion: number
  minSalesQty?: number | null

  isBase?: boolean
  isStock?: boolean
  isPurchase?: boolean
  isSales?: boolean
  isTransfer?: boolean

  unit?: Unit
}

/* ===============================
   🔹 Variants
   =============================== */

export interface VariantPayload {
  itemVariantId?: string
  tempId: string
  optionsKey: string
  options: { axis: string; value: string }[]
  displayName: string
  isActive?: boolean
  sortOrder?: number
}

/* ===============================
   🔹 Variant Units
   =============================== */

export interface VariantUnitPayload {
  itemVariantUnitId?: string | null
  itemVariantId?: string | null
  itemUnitId?: string | null
  tempId: string
  variantTempId: string | null
  unitTempId: string | null
  displayName?: string
  isActive?: boolean
}

/* ===============================
   🔹 Modifiers
   =============================== */

export interface ModifierPayload {
  itemModifierGroupId?: string
  tempId: string
  modifierGroupId: string
  isRequired?: boolean
  isActive?: boolean
  sortOrder?: number

  group?: ModifierGroup
}

/* ===============================
   🔹 Main Item Payload
   =============================== */

export interface ItemPayload {

  // === Header ===
  name: string
  description?: string | null
  kind: ItemKind
  materialType?: MaterialType | null
  itemCategoryId?: string | null

  hasVariant?: boolean
  hasModifier?: boolean
  hasRequiredModifier?: boolean
  useSameConfig?: boolean
  recipePolicy?: RecipePolicy | null
  isActive?: boolean
  meta?: Record<string, any> | null

  // === Global config fields (default template for SKU) ===
  config?: ConfigPayload

  // === Relations ===
  images?: ItemImage[]
  outlets: OutletPayload[]
  units: UnitPayload[]
  skus: SkuPayload[]
  variants?: VariantPayload[]
  variantUnits?: VariantUnitPayload[]
  modifiers?: ModifierPayload[]
  bom?: BomPayload | null
}

/* ===============================
   🔹 Error Shape (validation)
   =============================== */

export interface ItemPayloadErrors {
  name?: string[]
  itemCategoryId?: string[]
  description?: string[]
  kind?: string[]
  materialType?: string[]
  hasVariant?: string[]
  hasModifier?: string[]
  hasRequiredModifier?: string[]
  useSameConfig?: string[]
  recipePolicy?: string[]
  isActive?: string[]
  meta?: string[]

  config: string[]

  images: string[]
  outlets: string[]
  units: string[]
  skus: string[]
  variants: string[]
  variantUnits: string[]
  modifiers: string[]
}

export type UpdateItemPayload = ItemPayload
