export interface AdminPermission {
  id: string
  moduleId: string
  moduleName: string
  featureId?: string
  featureName?: string
  name: string
  slug: string
  description?: string
  action: 'view' | 'create' | 'update' | 'delete' | 'manage'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminPermissionForm {
  moduleId: string
  featureId?: string
  name: string
  slug: string
  description?: string
  action: 'view' | 'create' | 'update' | 'delete' | 'manage'
  isActive: boolean
}

export type AdminPermissionFormErrors = Partial<Record<keyof AdminPermissionForm, string>>
