import ProductModel from '@/models/product/ProductModel'
import type { Item } from '@/types/models/product/item'

class ItemModel extends ProductModel<Item> {
  resource() {
    return 'items'
  }
}
export default ItemModel
