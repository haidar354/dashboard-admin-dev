import type { RequestQuery } from '@/types/api/request'
import type { City, Province } from '@/types/models/administrative'

export interface BusinessUnitQueryParams extends RequestQuery {
  fields?: any
  include?: any
  orderBy?: string[]
}

export interface BusinessUnitTableOptions {
  page: number
  itemsPerPage: number
  sortBy: {
    key: any[]
    order: 'asc' | 'desc'
  }[]
}

export interface BusinessUnit {
  businessUnitId: string
  name: string
  logo?: string | null
  description?: string | null
  provinceCode?: string
  cityCode?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null

  outletsCount?: number
  province?: Province
  city?: City
}

export interface BusinessUnitForm {
  name: string
  logo?: File | string
  description?: string
  provinceCode?: string
  cityCode?: string
  isActive?: boolean
}

export type BusinessUnitFormErrors = Partial<Record<keyof BusinessUnitForm, string>>
