import ProductModel from '@/models/product/ProductModel'
import type { ItemOutlet } from '@/types/models/inventory/item-outlet'

class ItemOutletModel extends ProductModel<ItemOutlet> {
  resource() {
    return 'item-outlets'
  }
}
export default ItemOutletModel
