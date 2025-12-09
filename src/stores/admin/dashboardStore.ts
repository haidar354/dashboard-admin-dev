// Admin Dashboard Store
import { defineStore } from 'pinia'
import {
  mockDashboardStats,
  mockTenantGrowth,
  mockRevenueData,
  mockSubscriptionStatus,
  mockRecentActivities,
} from '@/plugins/fake-api/handlers/admin/mockDashboardData'
import type {
  DashboardStats,
  TenantGrowthData,
  RevenueData,
  SubscriptionStatusData,
} from '@/types/models/admin'
import type { RecentActivity } from '@/plugins/fake-api/handlers/admin/mockDashboardData'

export const useAdminDashboardStore = defineStore('adminDashboardStore', {
  state: () => ({
    stats: {} as DashboardStats,
    tenantGrowth: [] as TenantGrowthData[],
    revenueData: [] as RevenueData[],
    subscriptionStatus: {} as SubscriptionStatusData,
    recentActivities: [] as RecentActivity[],
    isLoading: false,
  }),

  actions: {
    async fetchDashboardData() {
      this.isLoading = true
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        this.stats = mockDashboardStats
        this.tenantGrowth = mockTenantGrowth
        this.revenueData = mockRevenueData
        this.subscriptionStatus = mockSubscriptionStatus
        this.recentActivities = mockRecentActivities
      } finally {
        this.isLoading = false
      }
    },
  },
})
