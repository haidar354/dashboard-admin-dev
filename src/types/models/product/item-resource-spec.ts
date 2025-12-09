import type { RequestQuery } from '@/types/api/request'

export interface ItemQueryParams extends RequestQuery {
  fields?: any[]
  include?: any[]
  orderBy?: any[]
}
