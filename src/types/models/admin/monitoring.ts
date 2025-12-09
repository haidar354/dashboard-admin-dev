export interface AdminMonitoring {
  tenantHealth: TenantHealthStatus[]
  apiTraffic: ApiTrafficData
  systemHealth: SystemHealthData
}

export interface TenantHealthStatus {
  companyId: string
  companyName: string
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  lastActiveAt: string
  metrics: {
    apiCalls: number
    errorRate: number
    responseTime: number
    activeUsers: number
  }
}

export interface ApiTrafficData {
  totalRequests: number
  successRate: number
  averageResponseTime: number
  peakHour: string
  hourlyData: {
    hour: string
    requests: number
    errors: number
  }[]
  endpointStats: {
    endpoint: string
    calls: number
    avgTime: number
  }[]
}

export interface SystemHealthData {
  status: 'healthy' | 'degraded' | 'down'
  uptime: string
  services: {
    name: string
    status: 'up' | 'down' | 'degraded'
    responseTime: number
    lastCheck: string
  }[]
  resources: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
}
