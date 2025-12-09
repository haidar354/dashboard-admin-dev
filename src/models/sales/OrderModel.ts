import SalesModel from './SalesModel'
import type { Order } from '@/types/models/sales/order'

class OrderModel extends SalesModel<Order> {
  resource() {
    return 'orders'
  }
}
export default OrderModel
