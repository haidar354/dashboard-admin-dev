import type { modifierAllowedSorts } from '@/constants/inventory/modifier'

export interface ModifierGroupTableOptions {
  page: number
  itemsPerPage: number
  sortBy: {
    key: (typeof modifierAllowedSorts)[number][]
    order: 'asc' | 'desc'
  }[]
}
