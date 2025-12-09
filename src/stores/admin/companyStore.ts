// Admin Company Store (Tenant Management)
import { mockCompanies } from '@/plugins/fake-api/handlers/admin/mockTenantData'
import type { RequestQueryModel } from '@/types/api/request'
import type { PaginateData } from '@/types/api/response'
import type { AdminCompany, AdminCompanyForm } from '@/types/models/admin'
import { showToast } from '@/utils/toaster'
import { defineStore } from 'pinia'

export const useAdminCompanyStore = defineStore('adminCompanyStore', {
  state: () => ({
    paginateData: { data: [], meta: { from: 0, to: 0, total: 0, perPage: 10, currentPage: 1, lastPage: 1 } } as PaginateData<AdminCompany>,
    companies: [] as AdminCompany[],
    selectedCompany: null as AdminCompany | null,
    isLoading: false,
    isLoadingSubmit: false,
    isLoadingAction: false,
    requestQuery: {
      page: 1,
      perPage: 10,
      search: '',
    } as RequestQueryModel,
    additionalFilter: {
      status: '' as string,
      planId: '' as string,
    },
    form: {
      name: '',
      email: '',
      phone: '',
      address: '',
      planId: '',
    } as AdminCompanyForm,
    formErrors: {} as Partial<Record<keyof AdminCompanyForm, string>>,
    dialogVisible: false,
    dialogMode: 'create' as 'create' | 'edit' | 'view',
    suspendDialogVisible: false,
    suspendReason: '',
  }),

  actions: {
    async fetchCompanies() {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        
        let filteredData = [...mockCompanies]
        
        // Apply search filter
        if (this.requestQuery.search) {
          const search = this.requestQuery.search.toLowerCase()
          filteredData = filteredData.filter(c => 
            c.name.toLowerCase().includes(search) ||
            c.email.toLowerCase().includes(search) ||
            c.code.toLowerCase().includes(search)
          )
        }
        
        // Apply status filter
        if (this.additionalFilter.status) {
          filteredData = filteredData.filter(c => c.status === this.additionalFilter.status)
        }
        
        // Apply plan filter
        if (this.additionalFilter.planId) {
          filteredData = filteredData.filter(c => c.planId === this.additionalFilter.planId)
        }
        
        // Pagination
        const total = filteredData.length
        const perPage = this.requestQuery.perPage || 10
        const page = this.requestQuery.page || 1
        const start = (page - 1) * perPage
        const end = start + perPage
        
        this.paginateData = {
          data: filteredData.slice(start, end),
          meta: {
            from: start + 1,
            to: Math.min(end, total),
            total,
            perPage,
            currentPage: page,
            lastPage: Math.ceil(total / perPage),
          },
        }
        this.companies = filteredData
      } finally {
        this.isLoading = false
      }
    },

    async fetchCompanyDetail(companyId: string) {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        this.selectedCompany = mockCompanies.find(c => c.id === companyId) || null
      } finally {
        this.isLoading = false
      }
    },

    async suspendCompany(companyId: string, reason: string) {
      this.isLoadingAction = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const index = mockCompanies.findIndex(c => c.id === companyId)
        if (index !== -1) {
          mockCompanies[index].status = 'suspended'
          mockCompanies[index].suspendedAt = new Date().toISOString()
          mockCompanies[index].suspendReason = reason
        }
        
        showToast('Company berhasil di-suspend', 'success')
        this.suspendDialogVisible = false
        this.suspendReason = ''
        await this.fetchCompanies()
      } catch (error) {
        showToast('Gagal suspend company', 'error')
        throw error
      } finally {
        this.isLoadingAction = false
      }
    },

    async resumeCompany(companyId: string) {
      this.isLoadingAction = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const index = mockCompanies.findIndex(c => c.id === companyId)
        if (index !== -1) {
          mockCompanies[index].status = 'active'
          mockCompanies[index].suspendedAt = undefined
          mockCompanies[index].suspendReason = undefined
        }
        
        showToast('Company berhasil diaktifkan kembali', 'success')
        await this.fetchCompanies()
      } catch (error) {
        showToast('Gagal mengaktifkan company', 'error')
        throw error
      } finally {
        this.isLoadingAction = false
      }
    },

    async deleteCompany(companyId: string) {
      this.isLoadingAction = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const index = mockCompanies.findIndex(c => c.id === companyId)
        if (index !== -1) {
          mockCompanies.splice(index, 1)
        }
        
        showToast('Company berhasil dihapus', 'success')
        await this.fetchCompanies()
      } catch (error) {
        showToast('Gagal menghapus company', 'error')
        throw error
      } finally {
        this.isLoadingAction = false
      }
    },

    resetForm() {
      this.form = {
        name: '',
        email: '',
        phone: '',
        address: '',
        planId: '',
      }
      this.formErrors = {}
      this.selectedCompany = null
    },

    resetFilter() {
      this.additionalFilter = {
        status: '',
        planId: '',
      }
      this.requestQuery.page = 1
    },
  },
})
