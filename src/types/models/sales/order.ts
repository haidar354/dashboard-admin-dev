// --- Base Order (summary) ---
export interface Order {
  orderId: string
  orderCode: string
  status: string
  isHold: boolean
  customerName: string | null
  customerPhone: string | null
  grandTotal: number
  paidTotal: number
  changeDue: number
  createdAt: string
  paidAt: string | null

  outlet?: {
    outletId: string
    name: string
  } | null

  salesChannel?: {
    salesChannelId: string
    name: string
  } | null
}
