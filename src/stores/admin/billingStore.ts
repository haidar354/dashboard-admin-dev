// Admin Billing Stores
import { mockInvoices, mockPayments, mockPlans, mockSubscriptions } from '@/plugins/fake-api/handlers/admin/mockBillingData'
import type { RequestQueryModel } from '@/types/api/request'
import type { PaginateData } from '@/types/api/response'
import type { AdminInvoice, AdminPayment, AdminPlan, AdminPlanForm, AdminSubscription } from '@/types/models/admin'
import { showToast } from '@/utils/toaster'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

// Plan Store
export const useAdminPlanStore = defineStore('adminPlanStore', {
  state: () => ({
    plans: [] as AdminPlan[],
    selectedPlan: null as AdminPlan | null,
    isLoading: false,
    isLoadingSubmit: false,
    form: {
      name: '',
      code: '',
      description: '',
      price: 0,
      billingCycle: 'monthly',
      features: [],
      isActive: true,
    } as AdminPlanForm,
    dialogVisible: false,
    dialogMode: 'create' as 'create' | 'edit',
  }),

  actions: {
    async fetchPlans() {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        this.plans = mockPlans
      } finally {
        this.isLoading = false
      }
    },

    async createPlan() {
      this.isLoadingSubmit = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const newPlan: AdminPlan = {
          id: uuidv4(),
          ...this.form,
          sortOrder: this.plans.length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        mockPlans.push(newPlan)
        showToast('Plan berhasil ditambahkan', 'success')
        this.dialogVisible = false
        this.resetForm()
        await this.fetchPlans()
      } finally {
        this.isLoadingSubmit = false
      }
    },

    async updatePlan() {
      if (!this.selectedPlan) return
      
      this.isLoadingSubmit = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const index = mockPlans.findIndex(p => p.id === this.selectedPlan!.id)
        if (index !== -1) {
          mockPlans[index] = {
            ...mockPlans[index],
            ...this.form,
            updatedAt: new Date().toISOString(),
          }
        }
        
        showToast('Plan berhasil diperbarui', 'success')
        this.dialogVisible = false
        this.resetForm()
        await this.fetchPlans()
      } finally {
        this.isLoadingSubmit = false
      }
    },

    resetForm() {
      this.form = {
        name: '',
        code: '',
        description: '',
        price: 0,
        billingCycle: 'monthly',
        features: [],
        isActive: true,
      }
      this.selectedPlan = null
    },

    openDialog(mode: 'create' | 'edit', plan?: AdminPlan) {
      this.dialogMode = mode
      if (plan) {
        this.selectedPlan = plan
        this.form = {
          name: plan.name,
          code: plan.code,
          description: plan.description || '',
          price: plan.price,
          billingCycle: plan.billingCycle,
          features: [...plan.features],
          isActive: plan.isActive,
        }
      } else {
        this.resetForm()
      }
      this.dialogVisible = true
    },
  },
})

// Subscription Store
export const useAdminSubscriptionStore = defineStore('adminSubscriptionStore', {
  state: () => ({
    paginateData: { data: [], meta: { from: 0, to: 0, total: 0, perPage: 10, currentPage: 1, lastPage: 1 } } as PaginateData<AdminSubscription>,
    subscriptions: [] as AdminSubscription[],
    selectedSubscription: null as AdminSubscription | null,
    isLoading: false,
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
  }),

  actions: {
    async fetchSubscriptions() {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        
        let filteredData = [...mockSubscriptions]
        
        if (this.requestQuery.search) {
          const search = this.requestQuery.search.toLowerCase()
          filteredData = filteredData.filter(s => 
            s.companyName.toLowerCase().includes(search)
          )
        }
        
        if (this.additionalFilter.status) {
          filteredData = filteredData.filter(s => s.status === this.additionalFilter.status)
        }
        
        if (this.additionalFilter.planId) {
          filteredData = filteredData.filter(s => s.planId === this.additionalFilter.planId)
        }
        
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
        this.subscriptions = filteredData
      } finally {
        this.isLoading = false
      }
    },

    async cancelSubscription(subscriptionId: string, reason: string) {
      this.isLoadingAction = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const index = mockSubscriptions.findIndex(s => s.id === subscriptionId)
        if (index !== -1) {
          mockSubscriptions[index].status = 'cancelled'
          mockSubscriptions[index].cancelledAt = new Date().toISOString()
          mockSubscriptions[index].cancelReason = reason
        }
        
        showToast('Subscription berhasil dibatalkan', 'success')
        await this.fetchSubscriptions()
      } finally {
        this.isLoadingAction = false
      }
    },

    resetFilter() {
      this.additionalFilter = { status: '', planId: '' }
      this.requestQuery.page = 1
    },
  },
})

// Invoice Store
export const useAdminInvoiceStore = defineStore('adminInvoiceStore', {
  state: () => ({
    paginateData: { data: [], meta: { from: 0, to: 0, total: 0, perPage: 10, currentPage: 1, lastPage: 1 } } as PaginateData<AdminInvoice>,
    invoices: [] as AdminInvoice[],
    selectedInvoice: null as AdminInvoice | null,
    isLoading: false,
    isLoadingAction: false,
    requestQuery: {
      page: 1,
      perPage: 10,
      search: '',
    } as RequestQueryModel,
    additionalFilter: {
      status: '' as string,
    },
  }),

  actions: {
    async fetchInvoices() {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        
        let filteredData = [...mockInvoices]
        
        if (this.requestQuery.search) {
          const search = this.requestQuery.search.toLowerCase()
          filteredData = filteredData.filter(i => 
            i.companyName.toLowerCase().includes(search) ||
            i.invoiceNumber.toLowerCase().includes(search)
          )
        }
        
        if (this.additionalFilter.status) {
          filteredData = filteredData.filter(i => i.status === this.additionalFilter.status)
        }
        
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
        this.invoices = filteredData
      } finally {
        this.isLoading = false
      }
    },

    async markAsPaid(invoiceId: string) {
      this.isLoadingAction = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const index = mockInvoices.findIndex(i => i.id === invoiceId)
        if (index !== -1) {
          mockInvoices[index].status = 'paid'
          mockInvoices[index].paidAt = new Date().toISOString()
        }
        
        showToast('Invoice ditandai sudah dibayar', 'success')
        await this.fetchInvoices()
      } finally {
        this.isLoadingAction = false
      }
    },

    resetFilter() {
      this.additionalFilter = { status: '' }
      this.requestQuery.page = 1
    },
  },
})

// Payment Store
export const useAdminPaymentStore = defineStore('adminPaymentStore', {
  state: () => ({
    paginateData: { data: [], meta: { from: 0, to: 0, total: 0, perPage: 10, currentPage: 1, lastPage: 1 } } as PaginateData<AdminPayment>,
    payments: [] as AdminPayment[],
    isLoading: false,
    requestQuery: {
      page: 1,
      perPage: 10,
      search: '',
    } as RequestQueryModel,
    additionalFilter: {
      status: '' as string,
      paymentMethod: '' as string,
    },
  }),

  actions: {
    async fetchPayments() {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        
        let filteredData = [...mockPayments]
        
        if (this.requestQuery.search) {
          const search = this.requestQuery.search.toLowerCase()
          filteredData = filteredData.filter(p => 
            p.companyName.toLowerCase().includes(search) ||
            p.invoiceNumber.toLowerCase().includes(search)
          )
        }
        
        if (this.additionalFilter.status) {
          filteredData = filteredData.filter(p => p.status === this.additionalFilter.status)
        }
        
        if (this.additionalFilter.paymentMethod) {
          filteredData = filteredData.filter(p => p.paymentMethod === this.additionalFilter.paymentMethod)
        }
        
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
        this.payments = filteredData
      } finally {
        this.isLoading = false
      }
    },

    resetFilter() {
      this.additionalFilter = { status: '', paymentMethod: '' }
      this.requestQuery.page = 1
    },
  },
})
