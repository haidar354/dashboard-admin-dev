import type { DecimalString, UUID } from '@/types/models/product/item-modifier/modifier-group'
import type { ModifierOptionComponent } from '@/types/models/product/item-modifier/modifier-option-component'

export interface ModifierOption {
  modifierOptionId: UUID
  modifierGroupId: UUID
  name: string
  i18n?: Record<string, { name?: string } & Record<string, unknown>>

  /** harga penambah; dari backend: string desimal ("5000.00") */
  defaultPrice: DecimalString

  isDefault: boolean
  useComponent: boolean
  sortOrder: number
  isActive: boolean

  components: ModifierOptionComponent[]
}
