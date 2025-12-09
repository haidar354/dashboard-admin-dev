// --------------------------------------
// 🔹 Product Dashboard Types
// --------------------------------------

/**
 * Ringkasan metrik utama dashboard produk
 */
export interface ProductDashboardSummary {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  posProducts: number
  withVariant: number
  withoutVariant: number
  withModifier: number
  totalCategories: number
  activeCategories: number
  inactiveCategories: number
  posCategories: number
  totalUnits: number
  totalModifierGroups: number
  totalModifierOptions: number
}

/**
 * Top kategori berdasarkan jumlah produk
 */
export interface ProductDashboardTopCategory {
  itemCategoryId: string
  name: string
  productCount: number
}

/**
 * Struktur data utama dari API GetDashboard
 */
export interface ProductDashboardData {
  summary: ProductDashboardSummary
  topCategories: ProductDashboardTopCategory[]
}
