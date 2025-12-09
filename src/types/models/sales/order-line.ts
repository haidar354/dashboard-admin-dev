export interface OrderLine {
  orderLineId: string
  parentLineId?: string | null
  itemSkuId?: string | null
  itemName: string
  code?: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  isModifier: boolean
  notes?: string | null
  sortOrder?: number | null

  sku?: {
    itemSkuId: string
    displayName: string
    code: string
  } | null

  modifierOption?: {
    modifierOptionId: string
    name: string
  } | null

  childModifiers?: OrderLine[]
}
