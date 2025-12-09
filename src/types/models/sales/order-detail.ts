import type { Order } from './order'
import type { OrderLine } from '@/types/models/sales/order-line'
import type { OrderPayment } from '@/types/models/sales/order-payment'

// --- OrderDetail extends Order dengan relasi & breakdown lengkap ---
export interface OrderDetail extends Order {
  notes: string | null
  customerId: string | null
  subtotal: number
  discountTotal: number
  taxTotal: number
  serviceChargeTotal: number
  voidedAt: string | null
  refundedAt: string | null

  customer?: {
    customerId: string
    name: string
    phone: string | null
  } | null

  lines?: OrderLine[]
  payments?: OrderPayment[]

  createdByUser?: {
    userId: string
    name: string
  } | null

  paidByUser?: {
    userId: string
    name: string
  } | null
}
