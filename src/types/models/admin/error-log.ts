export interface AdminErrorLog {
  id: string
  companyId?: string
  companyName?: string
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical'
  source: string
  message: string
  stackTrace?: string
  context?: Record<string, any>
  userId?: string
  userName?: string
  requestUrl?: string
  requestMethod?: string
  userAgent?: string
  ipAddress?: string
  createdAt: string
}

export interface AdminErrorLogFilter {
  level?: string
  source?: string
  companyId?: string
  startDate?: string
  endDate?: string
}
