export interface Unit {
  unitId: string
  name: string
  code: string
  metric: string
  itemsCount?: number
  createdAt: string
  updatedAt: string
}

export interface UnitForm {
  name: string
  code: string
  metric: string
}

export type UnitFormErrors = Partial<Record<keyof UnitForm, string>>
