export interface ItemConfig {
  itemConfigId: string

  // tenant scope
  companyId: string
  businessUnitId: string

  // target
  itemId: string
  outletId: string | null

  // konfigurasi
  saleable: boolean
  showInPos: boolean
  isFavorite: boolean
  saleFulfillmentMode: 'RECIPE' | 'FINISHED_STOCK' | 'NONE'

  // stok & kebijakan
  manageStock: boolean
  allowNegativeStock: boolean
  minStockAlert: number

  // kasir
  cashierMaxPriceChangePct: number

  // produksi
  manufacturingSource: 'IN_HOUSE' | 'PURCHASED' | 'EITHER'
  productionSitePolicy: 'CENTRAL_ONLY' | 'OUTLET_ONLY' | 'EITHER'
  centralKitchenOutletId: string | null
  batchSize: number
  leadTimeDays: number

  // status
  isActive: boolean
}
