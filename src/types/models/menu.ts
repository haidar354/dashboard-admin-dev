export interface Menu {
  menuId: string
  menuCategoryId: string
  name: string
  photo?: string
  priceDineIn: string
  priceTakeAway: string
  priceOnlineOrder: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface MenuOutletForm {
  outletId: string
  isActive: boolean
  menuCategoryId: string
  priceDineIn: number
  priceTakeAway: number
  priceOnlineOrder: number
}

export interface MenuItemForm {
  itemId: string
  isKitchenItem: boolean
  kitchenStationId?: string
  isToppingOnly: boolean
  isActive: boolean
  sortOrder: number
  priceDineIn: number
  priceTakeAway: number
  priceOnlineOrder: number
}

export interface MenuForm {
  name: string
  photo?: string | File
  sortOrder: number
  outlets: MenuOutletForm[]
  items: MenuItemForm[]
}

export type MenuFormErrors = Partial<Record<keyof MenuForm, string>>
