export interface AdminPlanCapability {
  id: string
  planId: string
  planName: string
  modules: {
    moduleId: string
    moduleName: string
    enabled: boolean
    features: {
      featureId: string
      featureName: string
      enabled: boolean
    }[]
  }[]
  permissions: {
    permissionId: string
    permissionName: string
    enabled: boolean
  }[]
  createdAt: string
  updatedAt: string
}

export interface AdminTenantCapability {
  id: string
  companyId: string
  companyName: string
  planId: string
  planName: string
  overrides: {
    type: 'module' | 'feature' | 'permission'
    targetId: string
    targetName: string
    action: 'enable' | 'disable'
  }[]
  createdAt: string
  updatedAt: string
}

export interface AdminCapabilityOverrideForm {
  companyId: string
  type: 'module' | 'feature' | 'permission'
  targetId: string
  action: 'enable' | 'disable'
}
