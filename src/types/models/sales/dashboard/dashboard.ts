/** Filter parameters used for dashboard queries */
export interface SalesDashboardFilters {
  from: string // YYYY-MM-DD
  to: string // YYYY-MM-DD
  outletId: string | null
  salesChannelId: string | null
  groupBy: 'day' | 'week' | 'month' | 'today'
}

export type DateRange = 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom'

/** Summary KPI section */
export interface SalesDashboardSummary {
  grossSales: number
  netSales: number
  cogsTotal: number
  grossProfit: number
  marginPct: number
  orderCount: number
  avgTicket: number
  itemsPerOrder: number
  refundRate: number
}

/** Daily / weekly / monthly trend line */
export interface SalesDashboardTrend {
  period: string // e.g. '2025-11-03' or '2025-11'
  netSales: number
  cogsTotal: number
  grossProfit: number
  marginPct: number
  orderCount: number
}

/** Top-selling products */
export interface SalesDashboardTopProduct {
  itemSkuId: string
  name: string
  code: string
  qtySold: number
  netSales: number
  cogsTotal: number
  grossProfit: number
  marginPct: number
}

/** Sales grouped by outlet */
export interface SalesDashboardByOutlet {
  outletId: string
  outletName: string
  grossSales: number
  netSales: number
  cogsTotal: number
  grossProfit: number
  marginPct: number
  totalOrders: number
}

/** Hourly traffic heatmap */
export interface SalesDashboardHeatmap {
  hourOfDay: number // 0–23
  grossSales: number
  orderCount: number
}

/** Full dashboard response from backend */
export interface SalesDashboardResponse {
  filters: SalesDashboardFilters
  summary: SalesDashboardSummary
  trend: SalesDashboardTrend[]
  topProducts: SalesDashboardTopProduct[]
  byOutlet: SalesDashboardByOutlet[]
  heatmap: SalesDashboardHeatmap[]
}
