export interface AdminPayment {
  id: string
  invoiceId: string
  invoiceNumber: string
  companyId: string
  companyName: string
  amount: number
  paymentMethod: 'bank_transfer' | 'credit_card' | 'e_wallet' | 'virtual_account'
  paymentGateway: 'midtrans' | 'xendit' | 'manual'
  transactionId?: string
  status: 'pending' | 'success' | 'failed' | 'expired' | 'refunded'
  paidAt?: string
  expiredAt?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface AdminPaymentCallback {
  transactionId: string
  status: 'success' | 'failed'
  paymentMethod: string
  paidAt?: string
}
