import ProductModel from './ProductModel'
import type { ItemCategory } from '@/types/models/product/item-category'

class ItemCategoryModel extends ProductModel<ItemCategory> {
  resource() {
    return 'item-categories'
  }
}
export default ItemCategoryModel
