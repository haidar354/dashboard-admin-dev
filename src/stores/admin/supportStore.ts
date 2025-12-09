// Admin Support Stores
import { mockApiTraffic, mockErrorLogs, mockSystemHealth, mockTenantHealth, mockTickets } from '@/plugins/fake-api/handlers/admin/mockSupportData'
import type { RequestQueryModel } from '@/types/api/request'
import type { PaginateData } from '@/types/api/response'
import type {
    AdminErrorLog,
    AdminTicket,
    AdminTicketReply,
    ApiTrafficData,
    SystemHealthData,
    TenantHealthStatus
} from '@/types/models/admin'
import { showToast } from '@/utils/toaster'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

// Ticket Store
export const useAdminTicketStore = defineStore('adminTicketStore', {
  state: () => ({
    paginateData: { data: [], meta: { from: 0, to: 0, total: 0, perPage: 10, currentPage: 1, lastPage: 1 } } as PaginateData<AdminTicket>,
    tickets: [] as AdminTicket[],
    selectedTicket: null as AdminTicket | null,
    isLoading: false,
    isLoadingAction: false,
    requestQuery: {
      page: 1,
      perPage: 10,
      search: '',
    } as RequestQueryModel,
    additionalFilter: {
      status: '' as string,
      priority: '' as string,
      category: '' as string,
    },
    replyMessage: '',
  }),

  actions: {
    async fetchTickets() {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        
        let filteredData = [...mockTickets]
        
        if (this.requestQuery.search) {
          const search = this.requestQuery.search.toLowerCase()
          filteredData = filteredData.filter(t => 
            t.subject.toLowerCase().includes(search) ||
            t.ticketNumber.toLowerCase().includes(search) ||
            t.companyName?.toLowerCase().includes(search)
          )
        }
        
        if (this.additionalFilter.status) {
          filteredData = filteredData.filter(t => t.status === this.additionalFilter.status)
        }
        
        if (this.additionalFilter.priority) {
          filteredData = filteredData.filter(t => t.priority === this.additionalFilter.priority)
        }
        
        if (this.additionalFilter.category) {
          filteredData = filteredData.filter(t => t.category === this.additionalFilter.category)
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
        this.tickets = filteredData
      } finally {
        this.isLoading = false
      }
    },

    async fetchTicketDetail(ticketId: string) {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        this.selectedTicket = mockTickets.find(t => t.id === ticketId) || null
      } finally {
        this.isLoading = false
      }
    },

    async replyTicket(ticketId: string, message: string) {
      this.isLoadingAction = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const index = mockTickets.findIndex(t => t.id === ticketId)
        if (index !== -1) {
          const reply: AdminTicketReply = {
            id: uuidv4(),
            ticketId,
            userId: 'user-current',
            userName: 'Admin Support',
            userRole: 'support',
            message,
            createdAt: new Date().toISOString(),
          }
          mockTickets[index].replies.push(reply)
          mockTickets[index].status = 'waiting_response'
          mockTickets[index].updatedAt = new Date().toISOString()
          
          if (this.selectedTicket?.id === ticketId) {
            this.selectedTicket = { ...mockTickets[index] }
          }
        }
        
        showToast('Balasan berhasil dikirim', 'success')
        this.replyMessage = ''
      } finally {
        this.isLoadingAction = false
      }
    },

    async closeTicket(ticketId: string) {
      this.isLoadingAction = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const index = mockTickets.findIndex(t => t.id === ticketId)
        if (index !== -1) {
          mockTickets[index].status = 'closed'
          mockTickets[index].resolvedAt = new Date().toISOString()
          mockTickets[index].updatedAt = new Date().toISOString()
        }
        
        showToast('Ticket berhasil ditutup', 'success')
        await this.fetchTickets()
      } finally {
        this.isLoadingAction = false
      }
    },

    async assignTicket(ticketId: string, userId: string, userName: string) {
      this.isLoadingAction = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const index = mockTickets.findIndex(t => t.id === ticketId)
        if (index !== -1) {
          mockTickets[index].assignedTo = userId
          mockTickets[index].assignedToName = userName
          mockTickets[index].status = 'in_progress'
          mockTickets[index].updatedAt = new Date().toISOString()
        }
        
        showToast('Ticket berhasil di-assign', 'success')
        await this.fetchTickets()
      } finally {
        this.isLoadingAction = false
      }
    },

    resetFilter() {
      this.additionalFilter = { status: '', priority: '', category: '' }
      this.requestQuery.page = 1
    },
  },
})

// Error Log Store
export const useAdminErrorLogStore = defineStore('adminErrorLogStore', {
  state: () => ({
    paginateData: { data: [], meta: { from: 0, to: 0, total: 0, perPage: 10, currentPage: 1, lastPage: 1 } } as PaginateData<AdminErrorLog>,
    errorLogs: [] as AdminErrorLog[],
    selectedLog: null as AdminErrorLog | null,
    isLoading: false,
    requestQuery: {
      page: 1,
      perPage: 10,
      search: '',
    } as RequestQueryModel,
    additionalFilter: {
      level: '' as string,
      companyId: '' as string,
    },
  }),

  actions: {
    async fetchErrorLogs() {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        
        let filteredData = [...mockErrorLogs]
        
        if (this.requestQuery.search) {
          const search = this.requestQuery.search.toLowerCase()
          filteredData = filteredData.filter(e => 
            e.message.toLowerCase().includes(search) ||
            e.source.toLowerCase().includes(search) ||
            e.companyName?.toLowerCase().includes(search)
          )
        }
        
        if (this.additionalFilter.level) {
          filteredData = filteredData.filter(e => e.level === this.additionalFilter.level)
        }
        
        if (this.additionalFilter.companyId) {
          filteredData = filteredData.filter(e => e.companyId === this.additionalFilter.companyId)
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
        this.errorLogs = filteredData
      } finally {
        this.isLoading = false
      }
    },

    resetFilter() {
      this.additionalFilter = { level: '', companyId: '' }
      this.requestQuery.page = 1
    },
  },
})

// Monitoring Store
export const useAdminMonitoringStore = defineStore('adminMonitoringStore', {
  state: () => ({
    tenantHealth: [] as TenantHealthStatus[],
    apiTraffic: {} as ApiTrafficData,
    systemHealth: {} as SystemHealthData,
    isLoading: false,
  }),

  actions: {
    async fetchTenantHealth() {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        this.tenantHealth = mockTenantHealth
      } finally {
        this.isLoading = false
      }
    },

    async fetchApiTraffic() {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        this.apiTraffic = mockApiTraffic
      } finally {
        this.isLoading = false
      }
    },

    async fetchSystemHealth() {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        this.systemHealth = mockSystemHealth
      } finally {
        this.isLoading = false
      }
    },

    async fetchAll() {
      await Promise.all([
        this.fetchTenantHealth(),
        this.fetchApiTraffic(),
        this.fetchSystemHealth(),
      ])
    },
  },
})
