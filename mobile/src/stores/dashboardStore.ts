import { create } from 'zustand';
import { dashboardService, DashboardStats, TenantGrowthData, RevenueData, SubscriptionStatus, RecentActivity } from '../services/dashboard';

interface DashboardState {
  stats: DashboardStats | null;
  tenantGrowth: TenantGrowthData[];
  revenueData: RevenueData[];
  subscriptionStatus: SubscriptionStatus | null;
  recentActivities: RecentActivity[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchTenantGrowth: () => Promise<void>;
  fetchRevenueData: () => Promise<void>;
  fetchSubscriptionStatus: () => Promise<void>;
  fetchRecentActivities: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  tenantGrowth: [],
  revenueData: [],
  subscriptionStatus: null,
  recentActivities: [],
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [stats, tenantGrowth, revenueData, subscriptionStatus, recentActivities] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getTenantGrowth(),
        dashboardService.getRevenueData(),
        dashboardService.getSubscriptionStatus(),
        dashboardService.getRecentActivities(),
      ]);
      set({
        stats,
        tenantGrowth,
        revenueData,
        subscriptionStatus,
        recentActivities,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await dashboardService.getStats();
      set({ stats });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchTenantGrowth: async () => {
    try {
      const tenantGrowth = await dashboardService.getTenantGrowth();
      set({ tenantGrowth });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchRevenueData: async () => {
    try {
      const revenueData = await dashboardService.getRevenueData();
      set({ revenueData });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchSubscriptionStatus: async () => {
    try {
      const subscriptionStatus = await dashboardService.getSubscriptionStatus();
      set({ subscriptionStatus });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchRecentActivities: async () => {
    try {
      const recentActivities = await dashboardService.getRecentActivities();
      set({ recentActivities });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));
