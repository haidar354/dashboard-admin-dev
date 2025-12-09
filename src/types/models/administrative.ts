export interface Province {
  id: number
  code: string // 2 chars
  name: string
  meta?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface City {
  id: number
  code: string // 4 chars
  provinceCode: string // 2 chars
  name: string
  meta?: string | null
  createdAt?: string
  updatedAt?: string

  province: Province
}

export interface District {
  id: number
  code: string // 7 chars
  cityCode: string // 4 chars
  name: string
  meta?: string | null
  createdAt?: string
  updatedAt?: string

  city: City
}

export interface Village {
  id: number
  code: string // 10 chars
  districtCode: string // 7 chars
  name: string
  meta?: string | null
  createdAt?: string
  updatedAt?: string

  district: District
}
