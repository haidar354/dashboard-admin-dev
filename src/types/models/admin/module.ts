export interface AdminModule {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  isActive: boolean
  features: AdminFeature[]
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface AdminModuleForm {
  name: string
  slug: string
  description?: string
  icon?: string
  isActive: boolean
  sortOrder: number
}

export type AdminModuleFormErrors = Partial<Record<keyof AdminModuleForm, string>>
