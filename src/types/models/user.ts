import type { BusinessUnit } from './business-unit'
import type { Employee } from './employee'

export interface User {
  userId?: string
  email?: string
  emailVerifiedAt?: string | null
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  level?: string
  employee_profile?: Employee
  permissions?: string[]
  roles?: Role[]
  name?: string
  avatar?: string
  phone?: string
  address?: string
  isActive?: boolean
  status?: string
  companyId?: string
  businessUnitId?: string
  businessUnit?: BusinessUnit
}

export interface Role {
  id?: number
  name?: string
  guard_name?: string
  level?: string
  created_at?: string
  updated_at?: string
  user_id?: string | null
  role_id?: string | null
  guard?: string | null
  pivot?: {
    model_type?: string
    model_uuid?: string
    role_id?: number
  }
}

export interface Editor {
  id: string
  user_id: string
  email: string
  name: string
  photo: string | null
}
