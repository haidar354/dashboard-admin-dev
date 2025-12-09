import type { ItemModifier } from '@/types/models/product/item-modifier/item-modifier'
import type { ModifierOption } from '@/types/models/product/item-modifier/modifier-option'

export interface ItemModifierOptionPriceOverride {
  itemModifierOptionPriceOverrideId: string
  itemModifierId: string
  modifierGroupId: string
  modifierOptionId: string
  salesPrice: number

  itemModifier?: ItemModifier
  modifierOption?: ModifierOption
}
