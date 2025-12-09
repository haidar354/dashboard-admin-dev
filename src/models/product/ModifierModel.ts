import ProductModel from '@/models/product/ProductModel'
import type { ModifierGroup } from '@/types/models/product/item-modifier/modifier-group'

export default class ModifierGroupModel extends ProductModel<ModifierGroup> {
  resource() {
    return 'modifier-groups'
  }
}
