import type { RequestQuery } from '@/types/api/request'

export interface UnitQueryParams extends RequestQuery {
  fields?: any[]
  include?: any[]
  filters?: any[]
  orderBy?: any[]
}
