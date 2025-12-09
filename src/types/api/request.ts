export interface RequestQuery {
  page?: number
  perPage?: number
  orderField?: string
  orderDirection?: 'asc' | 'desc'
  [key: string]: any
}

export interface RequestQueryModel {
  page?: number
  perPage?: number
  search?: string
  fields?: string[]
  include?: string[]
  orderBy?: string[]
  [key: string]: any
}
