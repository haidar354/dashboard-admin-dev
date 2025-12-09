// Admin System Config Stores
import {
    mockFeatures,
    mockModules,
    mockPermissions,
    mockPlanCapabilities,
    mockTenantCapabilities
} from '@/plugins/fake-api/handlers/admin/mockSystemConfigData'
import type {
    AdminFeature,
    AdminModule,
    AdminPermission,
    PlanCapability,
    TenantCapabilityOverride
} from '@/types/models/admin'
import { showToast } from '@/utils/toaster'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

// Module Store
export const useAdminModuleStore = defineStore('adminModuleStore', {
  state: () => ({
    modules: [] as AdminModule[],
    selectedModule: null as AdminModule | null,
    isLoading: false,
    isLoadingSubmit: false,
    form: {
      code: '',
      name: '',
      description: '',
      icon: 'tabler-box',
      status: 'active' as 'active' | 'inactive' | 'beta',
    },
    dialogVisible: false,
    dialogMode: 'create' as 'create' | 'edit',
  }),

  actions: {
    async fetchModules() {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        this.modules = mockModules
      } finally {
        this.isLoading = false
      }
    },

    async createModule() {
      this.isLoadingSubmit = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const newModule: AdminModule = {
          id: uuidv4(),
          ...this.form,
          sortOrder: this.modules.length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        mockModules.push(newModule)
        showToast('Module berhasil ditambahkan', 'success')
        this.dialogVisible = false
        this.resetForm()
        await this.fetchModules()
      } finally {
        this.isLoadingSubmit = false
      }
    },

    async updateModule() {
      if (!this.selectedModule) return
      
      this.isLoadingSubmit = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const index = mockModules.findIndex(m => m.id === this.selectedModule!.id)
        if (index !== -1) {
          mockModules[index] = {
            ...mockModules[index],
            ...this.form,
            updatedAt: new Date().toISOString(),
          }
        }
        
        showToast('Module berhasil diperbarui', 'success')
        this.dialogVisible = false
        this.resetForm()
        await this.fetchModules()
      } finally {
        this.isLoadingSubmit = false
      }
    },

    async deleteModule(moduleId: string) {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const index = mockModules.findIndex(m => m.id === moduleId)
        if (index !== -1) {
          mockModules.splice(index, 1)
        }
        
        showToast('Module berhasil dihapus', 'success')
        await this.fetchModules()
      } finally {
        this.isLoading = false
      }
    },

    resetForm() {
      this.form = {
        code: '',
        name: '',
        description: '',
        icon: 'tabler-box',
        status: 'active',
      }
      this.selectedModule = null
    },

    openDialog(mode: 'create' | 'edit', module?: AdminModule) {
      this.dialogMode = mode
      if (module) {
        this.selectedModule = module
        this.form = {
          code: module.code,
          name: module.name,
          description: module.description || '',
          icon: module.icon || 'tabler-box',
          status: module.status,
        }
      } else {
        this.resetForm()
      }
      this.dialogVisible = true
    },
  },
})

// Feature Store
export const useAdminFeatureStore = defineStore('adminFeatureStore', {
  state: () => ({
    features: [] as AdminFeature[],
    selectedFeature: null as AdminFeature | null,
    isLoading: false,
    isLoadingSubmit: false,
    form: {
      moduleId: '',
      code: '',
      name: '',
      description: '',
      status: 'active' as 'active' | 'inactive' | 'beta',
    },
    dialogVisible: false,
    dialogMode: 'create' as 'create' | 'edit',
  }),

  actions: {
    async fetchFeatures() {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        this.features = mockFeatures
      } finally {
        this.isLoading = false
      }
    },

    async createFeature() {
      this.isLoadingSubmit = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const module = mockModules.find(m => m.id === this.form.moduleId)
        const newFeature: AdminFeature = {
          id: uuidv4(),
          moduleId: this.form.moduleId,
          moduleName: module?.name || '',
          code: this.form.code,
          name: this.form.name,
          description: this.form.description,
          status: this.form.status,
          createdAt: new Date().toISOString(),
        }
        
        mockFeatures.push(newFeature)
        showToast('Feature berhasil ditambahkan', 'success')
        this.dialogVisible = false
        this.resetForm()
        await this.fetchFeatures()
      } finally {
        this.isLoadingSubmit = false
      }
    },

    async deleteFeature(featureId: string) {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const index = mockFeatures.findIndex(f => f.id === featureId)
        if (index !== -1) {
          mockFeatures.splice(index, 1)
        }
        
        showToast('Feature berhasil dihapus', 'success')
        await this.fetchFeatures()
      } finally {
        this.isLoading = false
      }
    },

    resetForm() {
      this.form = {
        moduleId: '',
        code: '',
        name: '',
        description: '',
        status: 'active',
      }
      this.selectedFeature = null
    },

    openDialog(mode: 'create' | 'edit', feature?: AdminFeature) {
      this.dialogMode = mode
      if (feature) {
        this.selectedFeature = feature
        this.form = {
          moduleId: feature.moduleId,
          code: feature.code,
          name: feature.name,
          description: feature.description || '',
          status: feature.status,
        }
      } else {
        this.resetForm()
      }
      this.dialogVisible = true
    },
  },
})

// Permission Store
export const useAdminPermissionStore = defineStore('adminPermissionStore', {
  state: () => ({
    permissions: [] as AdminPermission[],
    isLoading: false,
    isLoadingSubmit: false,
    form: {
      code: '',
      name: '',
      module: '',
      description: '',
    },
    dialogVisible: false,
  }),

  actions: {
    async fetchPermissions() {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        this.permissions = mockPermissions
      } finally {
        this.isLoading = false
      }
    },

    async createPermission() {
      this.isLoadingSubmit = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const newPermission: AdminPermission = {
          id: uuidv4(),
          ...this.form,
          createdAt: new Date().toISOString(),
        }
        
        mockPermissions.push(newPermission)
        showToast('Permission berhasil ditambahkan', 'success')
        this.dialogVisible = false
        this.resetForm()
        await this.fetchPermissions()
      } finally {
        this.isLoadingSubmit = false
      }
    },

    async deletePermission(permissionId: string) {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const index = mockPermissions.findIndex(p => p.id === permissionId)
        if (index !== -1) {
          mockPermissions.splice(index, 1)
        }
        
        showToast('Permission berhasil dihapus', 'success')
        await this.fetchPermissions()
      } finally {
        this.isLoading = false
      }
    },

    resetForm() {
      this.form = {
        code: '',
        name: '',
        module: '',
        description: '',
      }
    },
  },
})

// Plan Capability Store
export const useAdminPlanCapabilityStore = defineStore('adminPlanCapabilityStore', {
  state: () => ({
    planCapabilities: [] as PlanCapability[],
    selectedCapability: null as PlanCapability | null,
    isLoading: false,
  }),

  actions: {
    async fetchPlanCapabilities() {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        this.planCapabilities = mockPlanCapabilities
      } finally {
        this.isLoading = false
      }
    },
  },
})

// Tenant Capability Store
export const useAdminTenantCapabilityStore = defineStore('adminTenantCapabilityStore', {
  state: () => ({
    capabilities: [] as TenantCapabilityOverride[],
    isLoading: false,
    isLoadingSubmit: false,
    form: {
      companyId: '',
      type: 'module' as 'module' | 'feature' | 'permission' | 'limit',
      targetId: '',
      action: 'add' as 'add' | 'remove' | 'modify',
      reason: '',
      expiresAt: '',
    },
    dialogVisible: false,
  }),

  actions: {
    async fetchCapabilities() {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        this.capabilities = mockTenantCapabilities
      } finally {
        this.isLoading = false
      }
    },

    async createCapability() {
      this.isLoadingSubmit = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        // Implementation would go here
        showToast('Capability berhasil ditambahkan', 'success')
        this.dialogVisible = false
        this.resetForm()
        await this.fetchCapabilities()
      } finally {
        this.isLoadingSubmit = false
      }
    },

    async deleteCapability(capabilityId: string) {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const index = mockTenantCapabilities.findIndex(o => o.id === capabilityId)
        if (index !== -1) {
          mockTenantCapabilities.splice(index, 1)
        }
        
        showToast('Capability berhasil dihapus', 'success')
        await this.fetchCapabilities()
      } finally {
        this.isLoading = false
      }
    },

    resetForm() {
      this.form = {
        companyId: '',
        type: 'module',
        targetId: '',
        action: 'add',
        reason: '',
        expiresAt: '',
      }
    },
  },
})
