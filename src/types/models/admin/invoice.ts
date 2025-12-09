export interface AdminInvoice {
  id: string
  invoiceNumber: string
  companyId: string
  companyName: string
  subscriptionId: string
  planName: string
  amount: number
  tax: number
  totalAmount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
  dueDate: string
  paidAt?: string
  paymentMethod?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface AdminInvoiceForm {
  companyId: string
  subscriptionId: string
  amount: number
  tax: number
  dueDate: string
  notes?: string
}

export type AdminInvoiceFormErrors = Partial<Record<keyof AdminInvoiceForm, string>>
