// Admin Navigation - Vertical Sidebar Menu
import type { VerticalNavItems } from '@/@layouts/types'

const adminNavigation: VerticalNavItems = [
  {
    title: 'Dashboard',
    icon: { icon: 'tabler-smart-home' },
    to: 'admin-dashboard',
    rules: [{ action: 'manage', subject: 'admin.dashboard' }],
  },
  {
    heading: 'IAM',
    rules: [{ action: 'manage', subject: 'admin.iam' }],
  },
  {
    title: 'Users',
    icon: { icon: 'tabler-users' },
    to: 'admin-iam-users',
    rules: [{ action: 'manage', subject: 'admin.iam.users' }],
  },
  {
    title: 'Roles',
    icon: { icon: 'tabler-shield-check' },
    to: 'admin-iam-roles',
    rules: [{ action: 'manage', subject: 'admin.iam.roles' }],
  },
  {
    heading: 'Tenant Management',
    rules: [{ action: 'manage', subject: 'admin.tenant' }],
  },
  {
    title: 'Companies',
    icon: { icon: 'tabler-building' },
    to: 'admin-tenant-companies',
    rules: [{ action: 'manage', subject: 'admin.tenant.companies' }],
  },
  {
    title: 'Business Units',
    icon: { icon: 'tabler-hierarchy-2' },
    to: 'admin-tenant-business-units',
    rules: [{ action: 'manage', subject: 'admin.tenant.business-units' }],
  },
  {
    title: 'Outlets',
    icon: { icon: 'tabler-building-store' },
    to: 'admin-tenant-outlets',
    rules: [{ action: 'manage', subject: 'admin.tenant.outlets' }],
  },
  {
    heading: 'Billing',
    rules: [{ action: 'manage', subject: 'admin.billing' }],
  },
  {
    title: 'Plans',
    icon: { icon: 'tabler-packages' },
    to: 'admin-billing-plans',
    rules: [{ action: 'manage', subject: 'admin.billing.plans' }],
  },
  {
    title: 'Subscriptions',
    icon: { icon: 'tabler-receipt' },
    to: 'admin-billing-subscriptions',
    rules: [{ action: 'manage', subject: 'admin.billing.subscriptions' }],
  },
  {
    title: 'Invoices',
    icon: { icon: 'tabler-file-invoice' },
    to: 'admin-billing-invoices',
    rules: [{ action: 'manage', subject: 'admin.billing.invoices' }],
  },
  {
    title: 'Payments',
    icon: { icon: 'tabler-cash' },
    to: 'admin-billing-payments',
    rules: [{ action: 'manage', subject: 'admin.billing.payments' }],
  },
  {
    heading: 'Support',
    rules: [{ action: 'manage', subject: 'admin.support' }],
  },
  {
    title: 'Tickets',
    icon: { icon: 'tabler-ticket' },
    to: 'admin-support-tickets',
    rules: [{ action: 'manage', subject: 'admin.support.tickets' }],
  },
  {
    title: 'Error Logs',
    icon: { icon: 'tabler-bug' },
    to: 'admin-support-error-logs',
    rules: [{ action: 'manage', subject: 'admin.support.errors' }],
  },
  {
    title: 'Monitoring',
    icon: { icon: 'tabler-activity' },
    to: 'admin-support-monitoring',
    rules: [{ action: 'manage', subject: 'admin.support.monitoring' }],
  },
  {
    heading: 'System Config',
    rules: [{ action: 'manage', subject: 'admin.config' }],
  },
  {
    title: 'Modules',
    icon: { icon: 'tabler-puzzle' },
    to: 'admin-config-modules',
    rules: [{ action: 'manage', subject: 'admin.config.modules' }],
  },
  {
    title: 'Features',
    icon: { icon: 'tabler-list-check' },
    to: 'admin-config-features',
    rules: [{ action: 'manage', subject: 'admin.config.features' }],
  },
  {
    title: 'Permissions',
    icon: { icon: 'tabler-lock' },
    to: 'admin-config-permissions',
    rules: [{ action: 'manage', subject: 'admin.config.permissions' }],
  },
  {
    title: 'Packages',
    icon: { icon: 'tabler-package' },
    to: 'admin-config-packages',
    rules: [{ action: 'manage', subject: 'admin.config.packages' }],
  },
  {
    title: 'Plan Capabilities',
    icon: { icon: 'tabler-settings-cog' },
    to: 'admin-config-plan-capabilities',
    rules: [{ action: 'manage', subject: 'admin.config.capabilities' }],
  },
  {
    title: 'Tenant Capability',
    icon: { icon: 'tabler-adjustments' },
    to: 'admin-config-tenant-capability',
    rules: [{ action: 'manage', subject: 'admin.config.capability' }],
  },
]

export default adminNavigation
