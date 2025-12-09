import type { Item } from '../item'
import type { Unit } from '../product/unit/unit'

export interface PurchaseOrder {
  purchaseOrderId: string
  outletId: string
  supplierId: string
  status: 'draft' | 'received'
  orderedAt: string
  expectedAt: string
  note?: string | null
  createdAt: string
  updatedAt: string
  supplierName: string
  outletName: string
}

export interface PurchaseOrderDetail {
  purchaseOrderId: string
  outletId: string
  supplierId: string
  status: 'draft' | 'received'
  orderedAt: string
  expectedAt: string
  note?: string | null
  createdAt: string
  updatedAt: string
  purchase_order_items: PurchaseOrderItem[]
}

export interface PurchaseOrderItem {
  orderItemId: string
  purchaseOrderId: string
  itemId: string
  quantity: number
  unitId: string
  createdAt: string
  updatedAt: string
  item?: Item
  unit?: Unit
  itemName?: string
  unitName?: string
  remainingquantity?: number
}

export interface PurchaseOrderItemDetail {
  orderItemId: string
  purchaseOrderId: string
  itemId: string
  quantity: number
  unitId: string
  createdAt: string
  updatedAt: string
  item: {
    itemId: string
    businessUnitId: string
    type: 'raw' | 'semi' | 'finished' | 'consumable'
    code: string
    name: string
    description: string
    itemCategoryId: string
    isSellable: boolean
    isTopping: boolean
    isActive: boolean
    createdAt: string
    updatedAt: string
    deletedAt: string | null
  }
  unit: {
    unitId: string
    name: string
    businessUnitId: string | null
    createdAt: string
    updatedAt: string
    laravel_through_key: string
  }
}

export interface PurchaseOrderForm {
  outletId: string
  supplierId: string
  expectedAt: string
  note?: string
  items: PurchaseOrderItemForm[]
}

export interface PurchaseOrderItemForm {
  itemId: string
  quantity: number
  unitId: string
}

export interface PurchaseOrderUpdateForm {
  outletId?: string
  supplierId?: string
  expectedAt?: string
  note?: string
  items?: PurchaseOrderItemUpdateForm[]
}

export interface PurchaseOrderItemUpdateForm {
  orderItemId?: string
  itemId: string
  quantity: number
  unitId: string
}

export interface PurchaseOrderBulkInsertForm {
  orders: PurchaseOrderForm[]
}

export type PurchaseOrderFormErrors = Partial<Record<keyof PurchaseOrderForm, string>>
export type PurchaseOrderItemFormErrors = Partial<Record<keyof PurchaseOrderItemForm, string>>

// Query parameters for purchase order list
export interface PurchaseOrderQueryParams {
  search?: string
  status?: 'draft' | 'received'
  orderedAt?: string
  expectedAt?: string
  orderedStart?: string
  orderedEnd?: string
  expectedStart?: string
  expectedEnd?: string
  page?: number
  per_page?: number
}

// Query parameters for purchase order items
export interface PurchaseOrderItemQueryParams {
  purchaseOrderId: string
  search?: string
  page?: number
  per_page?: number
}
