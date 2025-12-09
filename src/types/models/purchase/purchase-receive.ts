export interface PurchaseReceive {
  receiveId: string
  purchaseOrderId: string
  receivedAt: string
  receiverId?: string | null
  note?: string | null
  createdAt: string
  updatedAt: string
  outletId: string
  supplierId: string
  status: 'draft' | 'received'
  orderedAt: string
  expectedAt: string
}

export interface PurchaseReceiveDetail {
  receiveId: string
  purchaseOrderId: string
  receivedAt: string
  receiverId?: string | null
  note?: string | null
  createdAt: string
  updatedAt: string
  purchase_receive_items: PurchaseReceiveItem[]
}

export interface PurchaseReceiveItem {
  receiveItemId: string
  receiveId: string
  orderItemId: string
  itemId: string
  price: number
  quantity: number
  note?: string | null
  createdAt: string
  updatedAt: string
  purchase_order_item?: PurchaseReceiveOrderItem
}

export interface PurchaseReceiveOrderItem {
  orderItemId: string
  purchaseOrderId: string
  itemId: string
  quantity: number
  unitId: string
  createdAt: string
  updatedAt: string
  unit: {
    unitId: string
    name: string
    businessUnitId: string | null
    createdAt: string
    updatedAt: string
    laravel_through_key: string
  }
}

export interface PurchaseReceiveForm {
  purchaseOrderId: string
  receivedAt: string
  note?: string
  items: PurchaseReceiveItemForm[]
}

export interface PurchaseReceiveItemForm {
  orderItemId: string
  itemId: string
  price: number
  quantity: number
  note?: string
}

export interface PurchaseReceiveUpdateForm {
  receivedAt?: string
  note?: string
  items?: PurchaseReceiveItemUpdateForm[]
}

export interface PurchaseReceiveItemUpdateForm {
  receiveItemId?: string
  orderItemId: string
  itemId: string
  price: number
  quantity: number
  note?: string
}

export type PurchaseReceiveFormErrors = Partial<Record<keyof PurchaseReceiveForm, string>>
export type PurchaseReceiveItemFormErrors = Partial<Record<keyof PurchaseReceiveItemForm, string>>

// Query parameters for purchase receive list
export interface PurchaseReceiveQueryParams {
  search?: string
  purchaseOrderId?: string
  receivedAt?: string
  receivedStart?: string
  receivedEnd?: string
  page?: number
  per_page?: number
}

// Response types for API responses
export interface PurchaseReceiveCreateResponse {
  receivedAt: string
  note?: string | null
  receiveId: string
  purchaseOrderId: string
  updatedAt: string
  createdAt: string
  purchase_receive_items: PurchaseReceiveItem[]
}
