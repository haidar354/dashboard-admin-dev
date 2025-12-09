// Mock Data Part 4 - System Config (Modules, Features, Permissions, Capabilities)
import type {
  AdminModule,
  AdminFeature,
  AdminPermission,
  PlanCapability,
  TenantCapabilityOverride,
} from '@/types/models/admin'

// Modules
export const mockModules: AdminModule[] = [
  {
    id: 'module-1',
    code: 'POS',
    name: 'Point of Sale',
    description: 'Modul kasir dan transaksi penjualan',
    icon: 'tabler-cash-register',
    status: 'active',
    sortOrder: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'module-2',
    code: 'INVENTORY',
    name: 'Inventory Management',
    description: 'Modul manajemen stok dan gudang',
    icon: 'tabler-packages',
    status: 'active',
    sortOrder: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'module-3',
    code: 'PURCHASING',
    name: 'Purchasing',
    description: 'Modul pembelian dan supplier',
    icon: 'tabler-shopping-cart',
    status: 'active',
    sortOrder: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'module-4',
    code: 'ACCOUNTING',
    name: 'Accounting',
    description: 'Modul akuntansi dan keuangan',
    icon: 'tabler-calculator',
    status: 'active',
    sortOrder: 4,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'module-5',
    code: 'HR',
    name: 'Human Resource',
    description: 'Modul manajemen karyawan dan payroll',
    icon: 'tabler-users',
    status: 'active',
    sortOrder: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'module-6',
    code: 'REPORT',
    name: 'Reports & Analytics',
    description: 'Modul laporan dan analitik bisnis',
    icon: 'tabler-chart-bar',
    status: 'active',
    sortOrder: 6,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'module-7',
    code: 'CRM',
    name: 'Customer Relationship',
    description: 'Modul manajemen pelanggan',
    icon: 'tabler-heart-handshake',
    status: 'beta',
    sortOrder: 7,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'module-8',
    code: 'MARKETPLACE',
    name: 'Marketplace Integration',
    description: 'Integrasi dengan marketplace (Tokopedia, Shopee, dll)',
    icon: 'tabler-building-store',
    status: 'beta',
    sortOrder: 8,
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
  },
]

// Features
export const mockFeatures: AdminFeature[] = [
  // POS Features
  {
    id: 'feat-1',
    moduleId: 'module-1',
    moduleName: 'Point of Sale',
    code: 'POS_BASIC',
    name: 'Basic POS',
    description: 'Fitur kasir dasar',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'feat-2',
    moduleId: 'module-1',
    moduleName: 'Point of Sale',
    code: 'POS_DISCOUNT',
    name: 'Discount Management',
    description: 'Manajemen diskon dan promo',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'feat-3',
    moduleId: 'module-1',
    moduleName: 'Point of Sale',
    code: 'POS_MULTI_PAYMENT',
    name: 'Multi Payment',
    description: 'Split payment dengan berbagai metode',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  // Inventory Features
  {
    id: 'feat-4',
    moduleId: 'module-2',
    moduleName: 'Inventory Management',
    code: 'INV_BASIC',
    name: 'Basic Inventory',
    description: 'Manajemen stok dasar',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'feat-5',
    moduleId: 'module-2',
    moduleName: 'Inventory Management',
    code: 'INV_MULTI_WAREHOUSE',
    name: 'Multi Warehouse',
    description: 'Manajemen multi gudang',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'feat-6',
    moduleId: 'module-2',
    moduleName: 'Inventory Management',
    code: 'INV_BATCH_TRACKING',
    name: 'Batch Tracking',
    description: 'Tracking batch dan expired date',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  // Report Features
  {
    id: 'feat-7',
    moduleId: 'module-6',
    moduleName: 'Reports & Analytics',
    code: 'RPT_BASIC',
    name: 'Basic Reports',
    description: 'Laporan dasar',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'feat-8',
    moduleId: 'module-6',
    moduleName: 'Reports & Analytics',
    code: 'RPT_ADVANCED',
    name: 'Advanced Analytics',
    description: 'Analitik lanjutan dengan AI insights',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'feat-9',
    moduleId: 'module-6',
    moduleName: 'Reports & Analytics',
    code: 'RPT_EXPORT',
    name: 'Export Reports',
    description: 'Export ke PDF dan Excel',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
]

// Permissions
export const mockPermissions: AdminPermission[] = [
  // User Permissions
  { id: 'perm-1', code: 'user.view', name: 'Lihat User', module: 'IAM', description: 'Melihat daftar user', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'perm-2', code: 'user.create', name: 'Tambah User', module: 'IAM', description: 'Menambah user baru', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'perm-3', code: 'user.edit', name: 'Edit User', module: 'IAM', description: 'Mengedit data user', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'perm-4', code: 'user.delete', name: 'Hapus User', module: 'IAM', description: 'Menghapus user', createdAt: '2024-01-01T00:00:00Z' },
  
  // Transaction Permissions
  { id: 'perm-5', code: 'transaction.view', name: 'Lihat Transaksi', module: 'POS', description: 'Melihat daftar transaksi', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'perm-6', code: 'transaction.create', name: 'Buat Transaksi', module: 'POS', description: 'Membuat transaksi baru', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'perm-7', code: 'transaction.void', name: 'Void Transaksi', module: 'POS', description: 'Membatalkan transaksi', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'perm-8', code: 'transaction.refund', name: 'Refund Transaksi', module: 'POS', description: 'Melakukan refund', createdAt: '2024-01-01T00:00:00Z' },
  
  // Inventory Permissions
  { id: 'perm-9', code: 'inventory.view', name: 'Lihat Inventory', module: 'INVENTORY', description: 'Melihat data stok', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'perm-10', code: 'inventory.adjust', name: 'Adjust Stok', module: 'INVENTORY', description: 'Melakukan penyesuaian stok', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'perm-11', code: 'inventory.transfer', name: 'Transfer Stok', module: 'INVENTORY', description: 'Transfer antar gudang', createdAt: '2024-01-01T00:00:00Z' },
  
  // Report Permissions
  { id: 'perm-12', code: 'report.view', name: 'Lihat Laporan', module: 'REPORT', description: 'Melihat laporan', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'perm-13', code: 'report.export', name: 'Export Laporan', module: 'REPORT', description: 'Export laporan', createdAt: '2024-01-01T00:00:00Z' },
  
  // Settings Permissions
  { id: 'perm-14', code: 'settings.view', name: 'Lihat Pengaturan', module: 'SETTINGS', description: 'Melihat pengaturan', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'perm-15', code: 'settings.edit', name: 'Edit Pengaturan', module: 'SETTINGS', description: 'Mengubah pengaturan', createdAt: '2024-01-01T00:00:00Z' },
]

// Plan Capabilities
export const mockPlanCapabilities: PlanCapability[] = [
  // Starter Plan
  {
    id: 'cap-1',
    planId: 'plan-1',
    planName: 'Starter',
    modules: ['module-1', 'module-2'],
    moduleNames: ['Point of Sale', 'Inventory Management'],
    features: ['feat-1', 'feat-4', 'feat-7'],
    featureNames: ['Basic POS', 'Basic Inventory', 'Basic Reports'],
    permissions: ['perm-1', 'perm-5', 'perm-6', 'perm-9', 'perm-12'],
    limits: {
      maxUsers: 5,
      maxOutlets: 1,
      maxProducts: 500,
      maxTransactions: 1000,
      storageGB: 5,
    },
  },
  // Professional Plan
  {
    id: 'cap-2',
    planId: 'plan-2',
    planName: 'Professional',
    modules: ['module-1', 'module-2', 'module-3', 'module-6'],
    moduleNames: ['Point of Sale', 'Inventory Management', 'Purchasing', 'Reports & Analytics'],
    features: ['feat-1', 'feat-2', 'feat-3', 'feat-4', 'feat-5', 'feat-7', 'feat-8', 'feat-9'],
    featureNames: ['Basic POS', 'Discount Management', 'Multi Payment', 'Basic Inventory', 'Multi Warehouse', 'Basic Reports', 'Advanced Analytics', 'Export Reports'],
    permissions: ['perm-1', 'perm-2', 'perm-3', 'perm-5', 'perm-6', 'perm-7', 'perm-9', 'perm-10', 'perm-11', 'perm-12', 'perm-13', 'perm-14'],
    limits: {
      maxUsers: 20,
      maxOutlets: 5,
      maxProducts: 5000,
      maxTransactions: 10000,
      storageGB: 50,
    },
  },
  // Enterprise Plan
  {
    id: 'cap-3',
    planId: 'plan-3',
    planName: 'Enterprise',
    modules: ['module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-6', 'module-7', 'module-8'],
    moduleNames: ['Point of Sale', 'Inventory Management', 'Purchasing', 'Accounting', 'Human Resource', 'Reports & Analytics', 'Customer Relationship', 'Marketplace Integration'],
    features: ['feat-1', 'feat-2', 'feat-3', 'feat-4', 'feat-5', 'feat-6', 'feat-7', 'feat-8', 'feat-9'],
    featureNames: ['Basic POS', 'Discount Management', 'Multi Payment', 'Basic Inventory', 'Multi Warehouse', 'Batch Tracking', 'Basic Reports', 'Advanced Analytics', 'Export Reports'],
    permissions: ['perm-1', 'perm-2', 'perm-3', 'perm-4', 'perm-5', 'perm-6', 'perm-7', 'perm-8', 'perm-9', 'perm-10', 'perm-11', 'perm-12', 'perm-13', 'perm-14', 'perm-15'],
    limits: {
      maxUsers: -1, // unlimited
      maxOutlets: -1,
      maxProducts: -1,
      maxTransactions: -1,
      storageGB: 500,
    },
  },
]

// Tenant Capabilities
export const mockTenantCapabilities: TenantCapabilityOverride[] = [
  {
    id: 'override-1',
    companyId: 'comp-1',
    companyName: 'PT Maju Bersama',
    planId: 'plan-2',
    planName: 'Professional',
    type: 'module',
    targetId: 'module-7',
    targetName: 'Customer Relationship',
    action: 'add',
    reason: 'Promo khusus early adopter',
    createdBy: 'user-1',
    createdByName: 'Admin Super',
    createdAt: '2024-03-01T00:00:00Z',
    expiresAt: '2024-12-31T23:59:59Z',
  },
  {
    id: 'override-2',
    companyId: 'comp-5',
    companyName: 'PT Global Makmur',
    planId: 'plan-3',
    planName: 'Enterprise',
    type: 'limit',
    targetId: 'maxUsers',
    targetName: 'Max Users',
    action: 'modify',
    oldValue: -1,
    newValue: 100,
    reason: 'Custom contract limitation',
    createdBy: 'user-1',
    createdByName: 'Admin Super',
    createdAt: '2024-02-15T00:00:00Z',
  },
]
