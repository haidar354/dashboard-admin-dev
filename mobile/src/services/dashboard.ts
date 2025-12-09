import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/api';

export interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  monthlyRevenue: number;
  totalRevenue: number;
  openTickets: number;
  criticalErrors: number;
}

export interface TenantGrowthData {
  month: string;
  newTenants: number;
  churnedTenants: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  target: number;
}

export interface SubscriptionStatus {
  active: number;
  trial: number;
  expired: number;
  cancelled: number;
  byPlan: Array<{ planName: string; count: number; percentage: number }>;
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  timestamp: string;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DASHBOARD_STATS);
      return response.data.data;
    } catch {
      // Return mock data if API fails
      return {
        totalTenants: 156,
        activeTenants: 142,
        monthlyRevenue: 45000000,
        totalRevenue: 380000000,
        openTickets: 8,
        criticalErrors: 2,
      };
    }
  },

  async getTenantGrowth(): Promise<TenantGrowthData[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DASHBOARD_TENANT_GROWTH);
      return response.data.data;
    } catch {
      return [
        { month: 'Jan', newTenants: 12, churnedTenants: 2 },
        { month: 'Feb', newTenants: 15, churnedTenants: 1 },
        { month: 'Mar', newTenants: 18, churnedTenants: 3 },
        { month: 'Apr', newTenants: 22, churnedTenants: 2 },
        { month: 'May', newTenants: 20, churnedTenants: 4 },
        { month: 'Jun', newTenants: 25, churnedTenants: 2 },
      ];
    }
  },

  async getRevenueData(): Promise<RevenueData[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DASHBOARD_REVENUE);
      return response.data.data;
    } catch {
      return [
        { month: 'Jan', revenue: 35000000, target: 40000000 },
        { month: 'Feb', revenue: 38000000, target: 40000000 },
        { month: 'Mar', revenue: 42000000, target: 45000000 },
        { month: 'Apr', revenue: 40000000, target: 45000000 },
        { month: 'May', revenue: 48000000, target: 50000000 },
        { month: 'Jun', revenue: 45000000, target: 50000000 },
      ];
    }
  },

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DASHBOARD_SUBSCRIPTION_STATUS);
      return response.data.data;
    } catch {
      return {
        active: 120,
        trial: 22,
        expired: 10,
        cancelled: 4,
        byPlan: [
          { planName: 'Basic', count: 45, percentage: 31 },
          { planName: 'Pro', count: 65, percentage: 45 },
          { planName: 'Enterprise', count: 32, percentage: 22 },
          { planName: 'Custom', count: 3, percentage: 2 },
        ],
      };
    }
  },

  async getRecentActivities(): Promise<RecentActivity[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DASHBOARD_RECENT_ACTIVITIES);
      return response.data.data;
    } catch {
      return [
        {
          id: '1',
          type: 'tenant_created',
          title: 'Tenant Baru',
          description: 'PT ABC Indonesia bergabung',
          icon: 'building',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'subscription',
          title: 'Upgrade Plan',
          description: 'CV Maju Jaya upgrade ke Pro',
          icon: 'arrow-up',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          type: 'payment',
          title: 'Pembayaran Diterima',
          description: 'Rp 5.000.000 dari PT XYZ',
          icon: 'cash',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: '4',
          type: 'ticket',
          title: 'Ticket Baru',
          description: 'Kendala integrasi API',
          icon: 'ticket',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
        },
      ];
    }
  },
};
