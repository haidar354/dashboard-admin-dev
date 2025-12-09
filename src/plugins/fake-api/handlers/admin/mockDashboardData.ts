// Admin Dashboard Statistics Data
import type {
  DashboardStats,
  TenantGrowthData,
  RevenueData,
  SubscriptionStatusData,
} from '@/types/models/admin'

export const mockDashboardStats: DashboardStats = {
  totalTenants: 156,
  activeTenants: 142,
  totalRevenue: 485750000,
  monthlyRevenue: 78500000,
  openTickets: 12,
  criticalErrors: 3,
  totalUsers: 1847,
  activeSubscriptions: 148,
}

export const mockTenantGrowth: TenantGrowthData[] = [
  { month: 'Jan', newTenants: 12, churnedTenants: 2, totalTenants: 128 },
  { month: 'Feb', newTenants: 15, churnedTenants: 1, totalTenants: 140 },
  { month: 'Mar', newTenants: 18, churnedTenants: 3, totalTenants: 155 },
  { month: 'Apr', newTenants: 14, churnedTenants: 2, totalTenants: 167 },
  { month: 'Mei', newTenants: 20, churnedTenants: 4, totalTenants: 183 },
  { month: 'Jun', newTenants: 16, churnedTenants: 3, totalTenants: 196 },
  { month: 'Jul', newTenants: 22, churnedTenants: 2, totalTenants: 216 },
  { month: 'Agt', newTenants: 19, churnedTenants: 5, totalTenants: 230 },
  { month: 'Sep', newTenants: 17, churnedTenants: 3, totalTenants: 244 },
  { month: 'Okt', newTenants: 21, churnedTenants: 4, totalTenants: 261 },
  { month: 'Nov', newTenants: 18, churnedTenants: 2, totalTenants: 277 },
  { month: 'Des', newTenants: 15, churnedTenants: 3, totalTenants: 289 },
]

export const mockRevenueData: RevenueData[] = [
  { month: 'Jan', revenue: 62500000, target: 60000000 },
  { month: 'Feb', revenue: 68000000, target: 65000000 },
  { month: 'Mar', revenue: 72500000, target: 70000000 },
  { month: 'Mei', revenue: 71000000, target: 72000000 },
  { month: 'Jun', revenue: 69500000, target: 70000000 },
  { month: 'Jul', revenue: 76000000, target: 75000000 },
  { month: 'Agt', revenue: 79500000, target: 78000000 },
  { month: 'Sep', revenue: 82000000, target: 80000000 },
  { month: 'Okt', revenue: 85500000, target: 82000000 },
  { month: 'Nov', revenue: 78500000, target: 80000000 },
  { month: 'Des', revenue: 92000000, target: 90000000 },
]

export const mockSubscriptionStatus: SubscriptionStatusData = {
  active: 142,
  trial: 8,
  expired: 4,
  cancelled: 2,
  byPlan: [
    { planName: 'Starter', count: 45, percentage: 30.4 },
    { planName: 'Professional', count: 78, percentage: 52.7 },
    { planName: 'Enterprise', count: 25, percentage: 16.9 },
  ],
}

// Recent Activities for Dashboard
export interface RecentActivity {
  id: string
  type: 'tenant_created' | 'subscription' | 'ticket' | 'payment' | 'error'
  title: string
  description: string
  timestamp: string
  icon: string
  color: string
}

export const mockRecentActivities: RecentActivity[] = [
  {
    id: 'act-1',
    type: 'tenant_created',
    title: 'Tenant Baru Terdaftar',
    description: 'PT Sukses Mandiri telah mendaftar dengan paket Professional',
    timestamp: '2024-03-15T14:30:00Z',
    icon: 'tabler-building-plus',
    color: 'success',
  },
  {
    id: 'act-2',
    type: 'subscription',
    title: 'Upgrade Subscription',
    description: 'CV Berkah Jaya upgrade dari Starter ke Professional',
    timestamp: '2024-03-15T13:45:00Z',
    icon: 'tabler-arrow-up-circle',
    color: 'primary',
  },
  {
    id: 'act-3',
    type: 'ticket',
    title: 'Ticket Urgent Dibuat',
    description: 'PT Global Makmur melaporkan error saat transaksi',
    timestamp: '2024-03-15T12:30:00Z',
    icon: 'tabler-ticket',
    color: 'error',
  },
  {
    id: 'act-4',
    type: 'payment',
    title: 'Pembayaran Diterima',
    description: 'PT Maju Bersama - Invoice #INV-2024-089 (Rp 1.500.000)',
    timestamp: '2024-03-15T11:15:00Z',
    icon: 'tabler-cash',
    color: 'success',
  },
  {
    id: 'act-5',
    type: 'error',
    title: 'Critical Error Terdeteksi',
    description: 'Database connection pool exhausted pada tenant comp-5',
    timestamp: '2024-03-15T10:00:00Z',
    icon: 'tabler-alert-triangle',
    color: 'error',
  },
  {
    id: 'act-6',
    type: 'subscription',
    title: 'Subscription Akan Berakhir',
    description: '3 tenant akan berakhir subscription-nya dalam 7 hari',
    timestamp: '2024-03-15T09:00:00Z',
    icon: 'tabler-clock-exclamation',
    color: 'warning',
  },
]
