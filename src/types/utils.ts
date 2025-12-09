export type Religion = typeof religions[number] | undefined
export type Gender = typeof genders[number] | undefined
export interface FormDataConvertible {
  [key: string]: any
}

export interface Module {
  name: string
  icon: string
  value: string
  status: 'active' | 'inactive' | 'coming-soon' | 'maintenance'
  redirect: string
}

export type OrderByVuetify = {
  key: string
  order: 'asc' | 'desc'
}[]
