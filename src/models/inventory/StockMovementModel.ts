import type { StockMovement } from '../../types/models/inventory/item-sku-stock/stock-movement'
import InventoryModel from '@/models/inventory/InventoryModel'

class StockMovementModel extends InventoryModel<StockMovement> {
  resource() {
    return 'stock-movements'
  }
}
export default StockMovementModel
