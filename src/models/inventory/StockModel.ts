import InventoryModel from './InventoryModel'
import type { Stock } from '@/types/models/inventory/stock'

class ItemStockModel extends InventoryModel<Stock> {
  resource() {
    return 'item-stocks'
  }
}
export default ItemStockModel
