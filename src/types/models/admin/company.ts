export interface AdminCompany {
  id: string
  name: string
  code: string
  email: string
  phone?: string
  address?: string
  logo?: string
  status: 'active' | 'suspended' | 'inactive'
  planId: string
  planName: string
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'cancelled'
  businessUnitCount: number
  outletCount: number
  userCount: number
  createdAt: string
  updatedAt: string
  suspendedAt?: string
  suspendReason?: string
}

export interface AdminCompanyForm {
  name: string
  code: string
  email: string
  phone?: string
  address?: string
  planId: string
}

export type AdminCompanyFormErrors = Partial<Record<keyof AdminCompanyForm, string>>
