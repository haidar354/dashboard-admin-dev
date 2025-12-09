import InventoryModel from '@/models/inventory/InventoryModel'
import type { Material } from '@/types/models/inventory/material'

class MaterialModel extends InventoryModel<Material> {
  resource() {
    return 'materials'
  }
}
export default MaterialModel
