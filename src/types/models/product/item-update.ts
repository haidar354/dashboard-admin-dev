// ========= Primitives =========
type UUID = string
type Minor = number
export type RecipeMode = 'none' | 'parent' | 'perVariant'

// ========= Root (PATCH-friendly: semua opsional) =========
export interface UpdateItemPayload {

  // base fields
  code?: string | null
  name?: string
  description?: string | null
  itemCategoryId?: UUID | null
  useSameConfig?: boolean

  // flags
  manageStock?: boolean
  isWeighted?: boolean
  isSellable?: boolean
  isActive?: boolean
  isFavorite?: boolean
  showInPos?: boolean
  hasVariant?: boolean
  hasModifier: boolean
  hasMultipleUnit?: boolean
  cashierMaxPriceChangePct?: number | null
  minStockAlert?: number | null
  meta?: Record<string, any> | null

  // relations/media
  outletIds?: UUID[] // kirim untuk RECONCILE outlet (delete by omission)
  itemImages?: ItemImageInput[] // kirim untuk atur urutan/primary

  // unit (upsert + delete by omission jika 'lines' dikirim)
  unit?: UnitUpdateSpec | null

  // recipe (object)
  recipe?: { mode?: RecipeMode; lines?: RecipeLine[] | null } | null

  // variants (generate mode saja)
  variant?: VariantUpdateSpec | null

  // modifiers (dua bentuk: array final atau objek FE yang dinormalisasi server)
  modifiers?: ModifierLink[] | null
  modifier?: ModifierSpec | null // FE helper, server akan map ke `modifiers`

  // inherit flag
  modifiersInheritToVariants?: boolean
}

// ========= ItemImage =========
export interface ItemImageInput {
  itemImageId: UUID
  isPrimary?: boolean
  displayOrder?: number
}

// ========= Unit Upsert =========
export interface UnitUpdateSpec {
  lines: UnitLineUpsert[]
}

export type UnitLineUpsert = UnitLineCreate | UnitLinePatch

export interface UnitLineCreate {

  // tanpa ID → CREATE
  name: string
  sku?: string | null
  barcode?: string | null
  isDefault?: boolean
  conversion: number // > 0
  referenceCost?: Minor // >= 0
  salesPrice?: Minor // >= 0
  minSalesQty?: number // >= 1
}

export interface UnitLinePatch {

  // dengan ID → UPDATE (field lain opsional)
  itemUnitId: UUID
  name?: string
  sku?: string | null
  barcode?: string | null
  isDefault?: boolean
  conversion?: number
  referenceCost?: Minor | null
  salesPrice?: Minor | null
  minSalesQty?: number | null
}

// ========= Recipe =========
export interface RecipeLine {
  materialItemId: UUID
  quantity: number | string
  note?: string | null
  materialItemName?: string | null
  materialUnitName?: string | null
}

// ========= Variants (Generate) =========
export interface VariantUpdateSpec {
  mode?: 'none' | 'generate' | null

  // jika mode=generate dan kamu kirim groups/variants → backend akan validasi sesuai rules
  groups?: VariantGroupSpec[]
  variants?: VariantChildSpec[]
}

export interface VariantGroupSpec {
  name: string
  slug?: string
  displayOrder?: number | null
  options: VariantGroupOptionSpec[]
}

export interface VariantGroupOptionSpec {
  name: string
  slug?: string
  position?: number | null
  isActive?: boolean
}

export interface VariantChildSpec {

  // kombinasi varian
  attributesBySlug: Record<string, string>

  // harga/identifiers
  sku: string // required jika variants dikirim
  barcode?: string
  purchasePrice: Minor // >= 0
  salesPrice: Minor // >= 0
  isDefault?: boolean
  showInPos?: boolean

  // recipe per-variant: boleh array atau object { lines: [...] }
  recipe?: RecipeLine[] | { lines: RecipeLine[] }
}

// ========= Modifiers =========
export interface ModifierSpec {
  overridePrice?: boolean
  lines: ModifierLink[] // FE object, server akan map ke `modifiers`
}

export interface ModifierLink {
  modifierGroupId: UUID
  sortOrder?: number
  priceDelta?: Minor
  options?: ModifierOptionOverride[] // per-option override (opsional)
}

export interface ModifierOptionOverride {
  modifierOptionId: UUID
  priceDeltaOverrideInMinor: Minor
}

// ========= Error map =========
export type UpdateItemPayloadErrors = Partial<Record<keyof UpdateItemPayload, string>>
