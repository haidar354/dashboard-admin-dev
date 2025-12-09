export interface OrderPayment {
  orderPaymentId: string
  paymentMethod: string
  amount: number
  referenceNo?: string | null
  note?: string | null
  isRefund: boolean
  createdAt: string

  receivedByUser?: {
    userId: string
    name: string
  } | null
}
