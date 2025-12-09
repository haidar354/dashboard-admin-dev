export interface AdminRole {
  id: string
  name: string
  slug: string
  description?: string
  permissions: string[]
  userCount: number
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminRoleForm {
  name: string
  slug: string
  description?: string
  permissions: string[]
}

export type AdminRoleFormErrors = Partial<Record<keyof AdminRoleForm, string>>
