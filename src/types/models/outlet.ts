import type { City, District, Province, Village } from './administrative'
import type { BusinessUnit } from '@/types/models/business-unit'
import type { Company } from '@/types/models/company'

export interface Outlet {
  outletId: string
  businessUnitId: string
  name: string
  code: string
  logo?: string | null
  address: string
  phone?: string | null
  provinceCode?: string | null
  cityCode?: string | null
  districtCode?: string | null
  villageCode?: string | null
  latitude?: number | string
  longitude?: number | string
  postalCode?: string | null
  isCentral: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null

  company?: Company
  businessUnit?: BusinessUnit
  province?: Province
  city?: City
  district?: District
  village?: Village
}

export interface OutletForm {
  name: string
  address: string
  phone?: string
  provinceCode?: string
  cityCode?: string
  districtCode?: string
  villageCode?: string
  latitude?: number | string
  longitude?: number | string
  postalCode?: string
  isCentral: boolean
  logo?: File | string
}

export type OutletFormErrors = Partial<Record<keyof OutletForm, string>>
