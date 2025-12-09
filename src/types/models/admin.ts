// Admin Dashboard Types

// ==================== IAM Types ====================
export interface AdminUser {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  role: AdminRole
  status: 'active' | 'inactive' | 'suspended'
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface AdminRole {
  id: string
  name: string
  code: string
  description?: string
  permissions: string[]
  isDefault?: boolean
  createdAt: string
}

export interface AdminUserForm {
  email: string
  name: string
  phone?: string
  roleId: string
  password?: string
  status: 'active' | 'inactive'
}

// ==================== Tenant Management Types ====================
export interface AdminCompany {
  id: string
  name: string
  code: string
  email: string
  phone?: string
  address?: string
  logo?: string
  status: 'active' | 'suspended' | 'inactive'
  planId: string
  planName: string
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'cancelled'
  businessUnitsCount: number
  outletsCount: number
  usersCount: number
  createdAt: string
  updatedAt: string
  suspendedAt?: string
  suspendReason?: string
}

export interface AdminBusinessUnit {
  id: string
  companyId: string
  companyName: string
  name: string
  code: string
  address?: string
  phone?: string
  status: 'active' | 'inactive'
  outletsCount: number
  createdAt: string
  updatedAt: string
}

export interface AdminOutlet {
  id: string
  businessUnitId: string
  businessUnitName: string
  companyId: string
  companyName: string
  name: string
  code: string
  address?: string
  phone?: string
  latitude?: number
  longitude?: number
  status: 'active' | 'inactive' | 'closed'
  isCentral: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminCompanyForm {
  name: string
  email: string
  phone?: string
  address?: string
  planId: string
}

export interface AdminBusinessUnitForm {
  companyId: string
  name: string
  code: string
  address?: string
  phone?: string
}

// ==================== Billing Types ====================
export interface AdminPlan {
  id: string
  name: string
  code: string
  description?: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  features: string[]
  isActive: boolean
  isPopular?: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface AdminSubscription {
  id: string
  companyId: string
  companyName: string
  planId: string
  planName: string
  status: 'active' | 'trial' | 'expired' | 'cancelled' | 'pending'
  startDate: string
  endDate: string
  trialEndDate?: string
  autoRenew: boolean
  price: number
  createdAt: string
  updatedAt: string
  cancelledAt?: string
  cancelReason?: string
}

export interface AdminInvoice {
  id: string
  invoiceNumber: string
  companyId: string
  companyName: string
  subscriptionId: string
  planName: string
  amount: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  dueDate: string
  paidAt?: string
  paymentMethod?: string
  notes?: string
  createdAt: string
}

export interface AdminPayment {
  id: string
  invoiceId: string
  invoiceNumber: string
  companyId: string
  companyName: string
  amount: number
  paymentMethod: 'bank_transfer' | 'credit_card' | 'ewallet' | 'va'
  paymentGateway: 'midtrans' | 'xendit' | 'manual'
  transactionId?: string
  status: 'pending' | 'success' | 'failed' | 'refunded'
  paidAt?: string
  createdAt: string
}

export interface AdminPlanForm {
  name: string
  code: string
  description?: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  features: string[]
  isActive: boolean
}

// ==================== Support Types ====================
export interface AdminTicket {
  id: string
  ticketNumber: string
  companyId?: string
  companyName?: string
  userId: string
  userName: string
  userEmail: string
  subject: string
  description: string
  category: 'technical' | 'billing' | 'feature_request' | 'general'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed'
  assignedTo?: string
  assignedToName?: string
  replies: AdminTicketReply[]
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

export interface AdminTicketReply {
  id: string
  ticketId: string
  userId: string
  userName: string
  userRole: 'customer' | 'support'
  message: string
  attachments?: string[]
  createdAt: string
}

export interface AdminErrorLog {
  id: string
  companyId?: string
  companyName?: string
  level: 'info' | 'warning' | 'error' | 'critical'
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

// ==================== System Config Types ====================
export interface AdminModule {
  id: string
  code: string
  name: string
  description?: string
  icon?: string
  status: 'active' | 'inactive' | 'beta'
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface AdminFeature {
  id: string
  moduleId: string
  moduleName: string
  code: string
  name: string
  description?: string
  status: 'active' | 'inactive' | 'beta'
  createdAt: string
}

export interface AdminPermission {
  id: string
  code: string
  name: string
  module: string
  description?: string
  createdAt: string
}

export interface PlanCapability {
  id: string
  planId: string
  planName: string
  modules: string[]
  moduleNames: string[]
  features: string[]
  featureNames: string[]
  permissions: string[]
  limits: {
    maxUsers: number
    maxOutlets: number
    maxProducts: number
    maxTransactions: number
    storageGB: number
  }
}

export interface TenantCapabilityOverride {
  id: string
  companyId: string
  companyName: string
  planId: string
  planName: string
  type: 'module' | 'feature' | 'permission' | 'limit'
  targetId: string
  targetName: string
  action: 'add' | 'remove' | 'modify'
  oldValue?: any
  newValue?: any
  reason: string
  createdBy: string
  createdByName: string
  createdAt: string
  expiresAt?: string
}

// ==================== Dashboard Stats Types ====================
export interface DashboardStats {
  totalTenants: number
  activeTenants: number
  totalRevenue: number
  monthlyRevenue: number
  openTickets: number
  criticalErrors: number
  totalUsers: number
  activeSubscriptions: number
}

export interface TenantGrowthData {
  month: string
  newTenants: number
  churnedTenants: number
  totalTenants: number
}

export interface RevenueData {
  month: string
  revenue: number
  target: number
}

export interface SubscriptionStatusData {
  active: number
  trial: number
  expired: number
  cancelled: number
  byPlan: {
    planName: string
    count: number
    percentage: number
  }[]
}
