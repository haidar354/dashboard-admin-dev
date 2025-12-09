import type { modifierAllowedFields, modifierAllowedIncludes, modifierAllowedSorts } from '@/constants/inventory/modifier'
import type { RequestQuery } from '@/types/api/request'

export type ModifierField = typeof modifierAllowedFields[number]
export type ModifierInclude = typeof modifierAllowedIncludes[number]
export type ModifierSort = typeof modifierAllowedSorts[number]

export interface ModifierQueryParams extends RequestQuery {
  fields?: any
  include?: any[]
  orderBy?: ModifierSort[]
}
