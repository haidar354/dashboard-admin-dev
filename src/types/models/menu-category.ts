export interface MenuCategory {
  menuCategoryId: string
  outletId: string
  name: string
  sortOrder: number
  showInPOS: boolean
  createdAt: string
  updatedAt: string
}

export interface MenuCategoryForm {
  outletId: string
  name: string
  sortOrder: number
  showInPOS: boolean
}

export interface MenuCategoryOutletForm {
  outletId: string
  sortOrder: number
}

export interface MenuCategoryBulkForm {
  name: string
  showInPOS: boolean
  outlets: MenuCategoryOutletForm[]
}

export type MenuCategoryFormErrors = Partial<Record<keyof MenuCategoryForm, string>>
