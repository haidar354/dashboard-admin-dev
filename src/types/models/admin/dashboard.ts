export interface AdminDashboardStats {
  totalCompanies: number
  activeCompanies: number
  suspendedCompanies: number
  totalUsers: number
  totalRevenue: number
  monthlyRevenue: number
  openTickets: number
  criticalErrors: number
  activeSubscriptions: number
  trialSubscriptions: number
  expiredSubscriptions: number
}

export interface AdminDashboardChart {
  tenantGrowth: {
    month: string
    count: number
  }[]
  revenueChart: {
    month: string
    revenue: number
  }[]
  subscriptionStatus: {
    status: string
    count: number
  }[]
  ticketsByCategory: {
    category: string
    count: number
  }[]
  errorTrend: {
    date: string
    count: number
  }[]
}
