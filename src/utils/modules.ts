import type { Module } from '@/types/utils'

export const MODULES: Module[] = [
  {
    name: 'Produk',
    icon: 'tabler-box',
    value: 'product',
    status: 'active',
    redirect: '/product/dashboard',
  },
  {
    name: 'Inventori',
    icon: 'tabler-building-warehouse',
    value: 'inventory',
    status: 'active',
    redirect: '/inventory/dashboard',
  },
  {
    name: 'Penjualan',
    icon: 'tabler-building-store',
    value: 'sales',
    status: 'active',
    redirect: '/sales/dashboard',
  },

  // {
  //   name: 'Pembelian',
  //   icon: 'tabler-shopping-cart',
  //   value: 'purchase',
  //   status: 'active',
  //   redirect: '/purchase/dashboard',
  // },
  {
    name: 'Karyawan',
    icon: 'tabler-user-circle',
    value: 'hr',
    status: 'active',
    redirect: '/hr/dashboard',
  },
  {
    name: 'Pengaturan',
    icon: 'tabler-settings',
    value: 'setting',
    status: 'active',
    redirect: '/setting/dashboard',
  },
]
