import type { Item } from '../item'
import type { Outlet } from '../outlet'
import type { Unit } from '../product/unit/unit'
import type { Supplier } from './supplier'

export interface PurchaseRequestList {
  purchaseRequestId: string
  outletId: string
  supplierId: string
  status: 'draft' | 'approved' | 'rejected' | 'completed' | 'canceled'
  totalAmount: number
  requestedAt: string
  note?: string
  outletName: string
  supplierName: string
  createdAt: string
  updatedAt: string
}

export interface PurchaseRequestDetail {
  purchaseRequestId: string
  outletId: string
  supplierId: string
  status: 'draft' | 'approved' | 'rejected' | 'completed' | 'canceled'
  totalAmount: number
  requestedAt: string
  note?: string
  createdAt: string
  updatedAt: string

  outlet?: Outlet
  supplier?: Supplier
  purchase_request_items?: PurchaseRequestItem[]
}

export interface PurchaseRequestItem {
  purchaseRequestItemId: string
  purchaseRequestId: string
  itemId: string
  qty: number
  unitId: string
  estimatedPrice?: number
  createdAt: string
  updatedAt: string
  item?: Item
  unit?: Unit
}

export interface PurchaseRequestItemDetail {
  purchaseRequestItemId: string
  purchaseRequestId: string
  itemId: string
  qty: number
  unitId: string
  estimatedPrice?: number
  createdAt: string
  updatedAt: string
  item?: Item
  unit?: Unit
}

export interface PurchaseRequestForm {
  outletId: string
  supplierId: string
  requestedAt: string
  note?: string
  items: PurchaseRequestItemForm[]
}

export interface PurchaseRequestItemForm {
  itemId: string
  qty: number
  unitId: string
  estimatedPrice?: number
}

export type PurchaseRequestFormErrors = Partial<Record<keyof PurchaseRequestForm, string>>
export type PurchaseRequestItemFormErrors = Partial<Record<keyof PurchaseRequestItemForm, string>>

// Query parameters for purchase request list
export interface PurchaseRequestQueryParams {
  search?: string
  status?: 'draft' | 'approved' | 'rejected' | 'completed' | 'canceled'
  orderField: string
  orderDirection: 'asc' | 'desc'
  page?: number
  perPage?: number
}
