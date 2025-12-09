import type { ModifierOption } from '@/types/models/product/item-modifier/modifier-option'

type ModifierGroupType = 'extra' | 'preference' | 'swap'
export type UUID = string
export type ISO8601 = string

export type DecimalString = string

export interface ModifierGroup {
  modifierGroupId: UUID
  companyId: UUID
  businessUnitId: UUID
  name: string
  i18n?: Record<string, { name?: string } & Record<string, unknown>>
  code: string

  type: ModifierGroupType
  multiple: boolean
  allowQuantity: boolean
  minSelect: number
  maxSelect: number
  isActive: boolean

  createdByUserId: UUID | null
  updatedByUserId: UUID | null
  createdAt: ISO8601
  updatedAt: ISO8601
  deletedAt: ISO8601 | null

  options: ModifierOption[]
}
