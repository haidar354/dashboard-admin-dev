export interface ApiResponse<T> {
  code?: number
  message: string
  data: T
}

export interface ApiPaginatedResponse<T> {
  message: string
  data: T[]
  meta: PaginateMeta
}

export interface Pagination {
  current_page: number
  from: number
  last_page: number
  path?: string
  per_page: number
  to: number
  total: number
}

export interface PaginatedMetaResponse {
  from: number
  to: number
  total: number
  perPage: number
  page: number
  lastPage: number
  hasMore?: boolean
}

export interface PaginatedResponse<T> extends Pagination {
  data: T[]
  meta: PaginatedMetaResponse
}

export interface PaginateMeta {
  from: number
  to: number
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  hasMore?: boolean
}

export interface PaginateData<T> {
  meta: PaginateMeta
  data: T[]
}
