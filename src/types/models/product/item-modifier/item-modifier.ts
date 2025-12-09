import type { ItemModifierOptionPriceOverride } from '@/types/models/product/item-modifier/item-modifier-option-price-overrides'
import type { ModifierGroup } from '@/types/models/product/item-modifier/modifier-group'

export interface ItemModifier {
  itemModifierId: string
  modifierGroupId: string
  itemId: string
  name: string
  overridePrice: boolean

  modifierGroup?: ModifierGroup
  itemModifierOptionPriceOverrides?: ItemModifierOptionPriceOverride[]
}
