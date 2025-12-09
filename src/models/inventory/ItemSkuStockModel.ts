import type { ItemSkuStock } from '../../types/models/inventory/item-sku-stock/item-sku-stock'
import InventoryModel from '@/models/inventory/InventoryModel'

class ItemSkuStockModel extends InventoryModel<ItemSkuStock> {
  resource() {
    return 'sku-stocks'
  }
}
export default ItemSkuStockModel
