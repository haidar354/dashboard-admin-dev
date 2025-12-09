import type { Outlet } from './outlet'
import type { Role } from './role'
import type { User } from './user'

export interface Employee {
  employeeId: string
  outletId: string
  userId: string
  address: string
  position: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null

  name: string
  email: string
  outlet: Outlet
  roles: Role[]
  user?: User
}

export interface EmployeeForm {
  outletId: string
  userId: string
  address: string
  position: string
  name: string
  pin?: string
  phone: string
  role: string
}

export type EmployeeFormErrors = Partial<Record<keyof EmployeeForm, string>>
