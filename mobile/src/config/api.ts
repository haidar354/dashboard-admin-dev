// API Configuration
export const API_BASE_URL = 'https://api-dev.bakoelku.com';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/platform/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  ME: '/auth/me',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/request-reset-password',
  RESET_PASSWORD: '/auth/reset-password',

  // IAM
  USERS: '/platform/iam/users',
  ROLES: '/platform/iam/roles',

  // Tenant
  COMPANIES: '/platform/tenant/companies',
  BUSINESS_UNITS: '/platform/tenant/business-units',
  OUTLETS: '/platform/tenant/outlets',

  // Billing
  PLANS: '/platform/billing/plans',
  SUBSCRIPTIONS: '/platform/billing/subscriptions',
  INVOICES: '/platform/billing/invoices',
  PAYMENTS: '/platform/billing/payments',

  // Support
  TICKETS: '/platform/support/tickets',
  ERROR_LOGS: '/platform/support/error-logs',
  MONITORING: '/platform/support/monitoring',

  // Config
  MODULES: '/platform/config/modules',
  FEATURES: '/platform/config/features',
  PERMISSIONS: '/platform/config/permissions',
  PACKAGES: '/platform/config/packages',
  PLAN_CAPABILITIES: '/platform/config/plan-capabilities',
  TENANT_CAPABILITY: '/platform/config/tenant-capability',

  // Dashboard
  DASHBOARD_STATS: '/platform/dashboard/stats',
  DASHBOARD_TENANT_GROWTH: '/platform/dashboard/tenant-growth',
  DASHBOARD_REVENUE: '/platform/dashboard/revenue',
  DASHBOARD_SUBSCRIPTION_STATUS: '/platform/dashboard/subscription-status',
  DASHBOARD_RECENT_ACTIVITIES: '/platform/dashboard/recent-activities',
};
