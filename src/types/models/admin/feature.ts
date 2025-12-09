export interface AdminFeature {
  id: string
  moduleId: string
  moduleName: string
  name: string
  slug: string
  description?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface AdminFeatureForm {
  moduleId: string
  name: string
  slug: string
  description?: string
  isActive: boolean
  sortOrder: number
}

export type AdminFeatureFormErrors = Partial<Record<keyof AdminFeatureForm, string>>
