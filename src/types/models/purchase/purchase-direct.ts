import type { Outlet } from '../outlet'
import type { Supplier } from './supplier'
import type { ItemSkuView, ItemUnitView } from '@/types/models/product/item'

// ==============================
// 📋 LIST RESOURCE
// ==============================
export interface PurchaseDirect {
  purchaseDirectId: string
  purchaseRequisitionId?: string
  outletId: string
  supplierId: string | null
  status: 'DRAFT' | 'COMPLETED' | 'CANCELLED'
  subtotal: number
  discountTotal: number
  taxTotal: number
  grandTotal: number
  paidTotal: number
  purchasedAt: string
  note?: string | null
  createdAt: string
  updatedAt: string

  documentCode?: string | null
  invoiceNumber?: string | null
  documentAttachment?: string | null

  outlet?: Outlet
  supplier?: Supplier
  items?: PurchaseDirectItem[]
}

// ==============================
// 🧱 ITEM RESOURCE
// ==============================
export interface PurchaseDirectItem {
  purchaseDirectItemId: string
  purchaseDirectId: string
  itemSkuId: string
  itemUnitId: string
  itemName: string
  qty: number
  unitPrice: number
  discount?: number
  tax?: number
  lineTotal: number
  note?: string | null
  sortOrder?: number
  createdAt: string
  updatedAt: string

  sku?: ItemSkuView
  itemUnit?: ItemUnitView
}

// ==============================
// ✍️ FORM PAYLOAD
// ==============================
export interface PurchaseDirectForm {
  purchaseRequisitionId?: string
  status: 'DRAFT' | 'COMPLETED' | 'CANCELLED'
  supplierId?: string | null
  outletId?: string
  note?: string | null
  purchasedAt?: string
  documentCode?: string | null
  invoiceNumber?: string | null
  documentAttachment?: File | null

  // summary totals
  subtotal?: number
  discountTotal?: number
  taxTotal?: number
  grandTotal?: number
  paidTotal?: number

  items?: PurchaseDirectItemForm[]
}

export interface PurchaseDirectItemForm {
  itemSkuId: string
  itemUnitId: string
  itemName?: string
  itemCode?: string
  qty: number
  unitPrice: number
  discount?: number
  tax?: number
  lineTotal?: number
  note?: string
  sortOrder?: number
  itemUnitName?: string
}

// ==============================
// 🚨 VALIDATION ERRORS
// ==============================
export type PurchaseDirectFormErrors = Partial<Record<keyof PurchaseDirectForm, string>>
export type PurchaseDirectItemFormErrors = Partial<Record<keyof PurchaseDirectItemForm, string>>

// ==============================
// 🔍 QUERY PARAMETERS
// ==============================
export interface PurchaseDirectQueryParams {
  q?: string
  status?: 'DRAFT' | 'COMPLETED' | 'CANCELED'
  supplierId?: string
  outletId?: string
  from?: string
  to?: string
  sort?: string
  perPage?: number
  page?: number
  include?: string[]
  fields?: string[]
}
