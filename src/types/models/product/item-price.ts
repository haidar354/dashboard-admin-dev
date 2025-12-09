export interface ItemPrice {
  itemPriceId: string
  outletId?: string
  itemId: string
  price: number
  referenceCost: number | null
  taxInclusive: boolean
  effectiveFrom: string
  effectiveTo: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
