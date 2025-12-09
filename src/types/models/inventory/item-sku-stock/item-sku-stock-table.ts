export interface ItemSkuStockTableOptions {
  page: number
  itemsPerPage: number
  sortBy: {
    key: any[]
    order: 'asc' | 'desc'
  }[]
}
