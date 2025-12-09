import type { RequestQuery } from '@/types/api/request'

export interface OrderQueryParams extends RequestQuery {
  fields?: any[]
  include?: any[]
  filters?: any[]
  orderBy?: any[]
}
