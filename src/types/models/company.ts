import type { RequestQuery } from '@/types/api/request'
import type { City, Province } from '@/types/models/administrative'

export interface CompanyQueryParams extends RequestQuery {
  fields?: any
  include?: any
  orderBy?: string[]
}

export interface CompanyTableOptions {
  page: number
  itemsPerPage: number
  sortBy: {
    key: any[]
    order: 'asc' | 'desc'
  }[]
}

export interface Company {
  companyId: string
  name: string
  logo?: string | null
  description?: string | null
  provinceCode?: string
  cityCode?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null

  businessUnitsCount?: number
  outletsCount?: number
  province?: Province
  city?: City
}

export interface CompanyForm {
  name: string
  logo?: File | string
  description?: string
  provinceCode?: string
  cityCode?: string
  isActive?: boolean
}

export type CompanyFormErrors = Partial<Record<keyof CompanyForm, string>>
