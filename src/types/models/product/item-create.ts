export type SaleFulfillmentMode = 'RECIPE' | 'FINISHED_STOCK' | 'NONE'
export type ManufacturingSource = 'IN_HOUSE' | 'PURCHASED'
export type ProductionSitePolicy = 'CENTRAL_ONLY' | 'OUTLET_ONLY' | 'EITHER'
export type RecipePolicy =
  | 'NONE'
  | 'ITEM_BOM_ONLY'
  | 'SKU_BOM_ONLY'
  | 'ITEM_BOM_WITH_SKU_OVERRIDES'

export type ItemKind = 'material' | 'product' | 'service' | 'bundle'
export type MaterialType = 'raw' | 'semi' | 'finished' | 'consumable'
export type CostMethod = 'STD' | 'MAVG' | 'FIFO'

/* 🔹 IMAGE */
export interface ItemImagePayload {
  itemImageId: string
  isPrimary?: boolean
  displayOrder?: number
}

/* 🔹 BOM LINE */
export interface BomLinePayload {
  materialItemSkuId: string
  quantity: number
  wastePct?: number
  consumeFromStock?: boolean
}

/* 🔹 BOM HEADER */
export interface BomPayload {
  yield?: number
  lines: BomLinePayload[]
}

/* 🔹 COST & PRICE */
export interface CostPayload {
  cost: number
  lastCost?: number | null
  method?: CostMethod | null
}

export interface PricePayload {
  price: number
  taxInclusive?: boolean
  qtyThreshold?: number
}

/* 🔹 CONFIG */
export interface ConfigPayload {
  saleable?: boolean
  showInPos?: boolean
  favorite?: boolean
  saleFulfillmentMode?: SaleFulfillmentMode | null
  manageStock?: boolean
  allowNegativeStock?: boolean
  minStockAlert?: number | null
  maxStock?: number | null
  leadTimeDays?: number | null
  manufacturingSource?: ManufacturingSource | null
  productionSitePolicy?: ProductionSitePolicy | null
  centralKitchenOutletId?: string | null
  batchSize?: number | null
}

/* 🔹 OVERRIDE (per outlet) */
export interface OverridePayload {
  outletId: string
  config?: ConfigPayload
  cost?: CostPayload
  price?: PricePayload
  bom?: BomPayload
}

/* 🔹 SKU (product variant item) */
export interface SkuPayload {
  tempId: string
  variantUnitTempId?: string | null
  displayName: string
  isActive?: boolean
  config?: ConfigPayload
  cost?: CostPayload
  price?: PricePayload
  bom?: BomPayload
  overrides?: OverridePayload[]
}

/* 🔹 UNIT */
export interface UnitPayload {
  tempId: string
  unitId: string
  conversion: number
  minSalesQty?: number | null
  isBase?: boolean
  isStock?: boolean
  isPurchase?: boolean
  isSales?: boolean
  isTransfer?: boolean
}

/* 🔹 VARIANT (definition, not SKU) */
export interface VariantPayload {
  tempId: string
  optionsKey: string
  options: string[]
  displayName: string
  isActive?: boolean
  sortOrder?: number
}

/* 🔹 VARIANT UNIT (kombinasi variant + unit) */
export interface VariantUnitPayload {
  tempId: string
  variantTempId: string
  unitTempId: string
  displayName?: string
  isActive?: boolean
}

/* 🔹 MAIN ITEM PAYLOAD */
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

  // Default manufacturing policy
  defaultSaleFulfillmentMode?: SaleFulfillmentMode | null
  defaultManufacturingSource?: ManufacturingSource | null
  defaultProductionSitePolicy?: ProductionSitePolicy | null
  defaultCentralKitchenOutletId?: string | null
  defaultBatchSize?: number | null
  defaultLeadTimeDays?: number | null

  // === Relations ===
  units: UnitPayload[]
  skus: SkuPayload[]
  variants?: VariantPayload[]
  variantUnits?: VariantUnitPayload[]
  images?: ItemImagePayload[]
}
