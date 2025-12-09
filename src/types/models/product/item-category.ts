import type { RequestQuery } from '@/types/api/request'
import type { BusinessUnit } from '@/types/models/business-unit'
import type { Outlet } from '@/types/models/outlet'
import type { Item } from '@/types/models/product/item'
import type { allowedIncludes, allowedSorts } from '@constants/inventory/item-category'

export interface ItemCategoryQueryParams extends RequestQuery {
  fields: any
  include: (typeof allowedIncludes)[number][]
  orderBy: string[]
}

export interface ItemCategoryTableOptions {
  page: number
  itemsPerPage: number
  sortBy: {
    key: (typeof allowedSorts)[number][]
    order: 'asc' | 'desc'
  }[]
}

export interface ItemCategory {
  itemCategoryId: string
  businessUnitId: string
  name: string
  description?: string
  itemsCount?: number
  showInPos: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string

  businessUnit?: BusinessUnit
  items?: Item[]
  outlets?: Outlet[]
  outletIds?: string[]
}

export interface ItemCategoryDetail {
  itemCategoryId: string
  businessUnitId: string
  name: string
  description?: string
  itemsCount?: number
  showInPos: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string

  businessUnit?: BusinessUnit
  items?: Item[]
}

export interface ItemCategoryForm {
  name: string
  description?: string
  showInPos: boolean
  isActive: boolean
  outletIds: string[]
}

export type ItemCategoryFormErrors = Partial<Record<keyof ItemCategoryForm, string>>
