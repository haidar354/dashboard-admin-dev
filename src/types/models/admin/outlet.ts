export interface AdminOutlet {
  id: string
  businessUnitId: string
  businessUnitName: string
  companyId: string
  companyName: string
  name: string
  code: string
  address?: string
  phone?: string
  latitude?: number
  longitude?: number
  status: 'active' | 'inactive' | 'maintenance'
  isCentral: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminOutletForm {
  businessUnitId: string
  name: string
  code: string
  address?: string
  phone?: string
  latitude?: string
  longitude?: string
  status: 'active' | 'inactive' | 'maintenance'
}

export type AdminOutletFormErrors = Partial<Record<keyof AdminOutletForm, string>>
