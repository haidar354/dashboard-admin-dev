export interface AdminBusinessUnit {
  id: string
  companyId: string
  companyName: string
  name: string
  code: string
  type: 'headquarter' | 'branch' | 'warehouse'
  address?: string
  phone?: string
  outletCount: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface AdminBusinessUnitForm {
  companyId: string
  name: string
  code: string
  type: 'headquarter' | 'branch' | 'warehouse'
  address?: string
  phone?: string
}

export type AdminBusinessUnitFormErrors = Partial<Record<keyof AdminBusinessUnitForm, string>>
