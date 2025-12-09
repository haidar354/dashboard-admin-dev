import ProductModel from './ProductModel'
import type { Unit } from '@/types/models/product/unit/unit'

class UnitModel extends ProductModel<Unit> {
  resource() {
    return 'units'
  }
}
export default UnitModel
