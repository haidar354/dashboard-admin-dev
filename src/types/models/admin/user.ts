export interface AdminUser {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: string
  roleId: string
  status: 'active' | 'inactive' | 'suspended'
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface AdminUserForm {
  name: string
  email: string
  phone?: string
  password?: string
  roleId: string
  status: 'active' | 'inactive'
}

export type AdminUserFormErrors = Partial<Record<keyof AdminUserForm, string>>
