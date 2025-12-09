import ProductModel from '@/models/product/ProductModel'
import type { ItemSkuView } from '@/types/models/product/item'

class ItemSkuModel extends ProductModel<ItemSkuView> {
  resource() {
    return 'item-skus'
  }
}
export default ItemSkuModel
