import PurchaseModel from '@/models/purchase/PurchaseModel'
import type { Order } from '@/types/models/sales/order'

class PurchaseDirectModel extends PurchaseModel<Order> {
  resource() {
    return 'purchase-directs'
  }
}
export default PurchaseDirectModel
