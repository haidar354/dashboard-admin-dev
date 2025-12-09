export interface ItemSkuStock {

  // --- Core Identitas SKU ---
  itemSkuId: string
  code: string | null
  displayName: string
  isActive: boolean
  itemType?: string
  unitName?: string

  quantityOnHand: number
  quantityAllocated: number
  quantityReserved: number

  // optional helper computed di frontend:
  openingQty?: number
  inQty?: number
  outQty?: number
  producedQty?: number
  soldQty?: number
  wastedQty?: number
  transitQty?: number
  closingQty?: number

  // --- Relasi Produk (Item) ---
  item: {
    itemId: string
    name: string
    kind: 'product' | 'material' | 'service' | 'bundle'
    category?: {
      itemCategoryId: string
      name: string
    } | null
  }

  // --- Unit Dasar / Variant Unit ---
  itemUnit?: {
    itemUnitId: string
    unitId: string
    conversion: number
    unit?: {
      unitId: string
      name: string
      code: string
    } | null
  } | null

  // --- Harga (Outlet Aware) ---
  price?: {
    amount: number
    currency: string
    taxInclusive: boolean
  } | null

  // --- Metadata Tambahan ---
  createdAt?: string
  updatedAt?: string
}
