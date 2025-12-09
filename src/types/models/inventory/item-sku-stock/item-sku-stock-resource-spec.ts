import type { RequestQuery } from '@/types/api/request'

export interface ItemSkuStockQueryParams extends RequestQuery {
  fields?: any
  include?: any
  orderBy?: any[]
}
