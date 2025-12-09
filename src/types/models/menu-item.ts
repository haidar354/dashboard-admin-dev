export interface MenuItem {
  menuItemId: string
  menuId: string
  itemId: string
  price: number
  createdAt: string
  updatedAt: string
}

export interface MenuItemForm {
  itemId: string
  isKitchenItem: boolean
  kitchenStationId?: string
  isToppingOnly: boolean
  isActive: boolean
  sortOrder?: number
}

export type MenuItemFormErrors = Partial<Record<keyof MenuItemForm, string>>
