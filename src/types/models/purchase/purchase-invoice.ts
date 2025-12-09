// Basic purchase invoice types - to be expanded when API endpoints are available
export interface PurchaseInvoice {
  invoiceId: string
  purchaseReceiveId: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  totalAmount: number
  paidAmount: number
  status: 'pending' | 'paid' | 'overdue'
  note?: string | null
  createdAt: string
  updatedAt: string
}

export interface PurchaseInvoiceDetail {
  invoiceId: string
  purchaseReceiveId: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  totalAmount: number
  paidAmount: number
  status: 'pending' | 'paid' | 'overdue'
  note?: string | null
  createdAt: string
  updatedAt: string
  invoice_items: PurchaseInvoiceItem[]
}

export interface PurchaseInvoiceItem {
  invoiceItemId: string
  invoiceId: string
  receiveItemId: string
  itemId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: string
  updatedAt: string
}

export interface PurchaseInvoiceForm {
  purchaseReceiveId: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  note?: string
  items: PurchaseInvoiceItemForm[]
}

export interface PurchaseInvoiceItemForm {
  receiveItemId: string
  itemId: string
  quantity: number
  unitPrice: number
}

export interface PurchaseInvoiceUpdateForm {
  invoiceNumber?: string
  invoiceDate?: string
  dueDate?: string
  note?: string
  items?: PurchaseInvoiceItemUpdateForm[]
}

export interface PurchaseInvoiceItemUpdateForm {
  invoiceItemId?: string
  receiveItemId: string
  itemId: string
  quantity: number
  unitPrice: number
}

export type PurchaseInvoiceFormErrors = Partial<Record<keyof PurchaseInvoiceForm, string>>
export type PurchaseInvoiceItemFormErrors = Partial<Record<keyof PurchaseInvoiceItemForm, string>>

// Query parameters for purchase invoice list
export interface PurchaseInvoiceQueryParams {
  search?: string
  status?: 'pending' | 'paid' | 'overdue'
  invoiceDate?: string
  dueDate?: string
  dateStart?: string
  dateEnd?: string
  page?: number
  per_page?: number
}
