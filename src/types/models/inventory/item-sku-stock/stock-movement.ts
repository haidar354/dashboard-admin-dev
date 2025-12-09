export type StockMovementType =
  | 'PURCHASE_IN'
  | 'SALE_OUT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'PRODUCED_IN'
  | 'WASTED_OUT'
  | 'ADJUSTED_IN'
  | 'ADJUSTED_OUT'
  | 'TRANSIT_IN'
  | 'TRANSIT_OUT'

export interface StockMovement {
  stockMovementId: string
  companyId: string
  businessUnitId: string
  outletId: string | null
  itemSkuId: string

  movementType: StockMovementType

  referenceType: string | null
  referenceId: string | null

  sourceOutletId?: string | null
  targetOutletId?: string | null

  quantityIn: number
  quantityOut: number

  userId: string | null
  notes: string | null

  movementDate: string
  createdAt: string
  updatedAt: string

  itemSku?: {
    itemSkuId: string
    displayName: string
    code?: string | null
  } | null

  outlet?: {
    outletId: string
    name: string
  } | null
}
