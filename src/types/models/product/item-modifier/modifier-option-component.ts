import type { ItemUnit } from '@/types/models/inventory/item-unit'
import type { Material } from '@/types/models/inventory/material'
import type { DecimalString, UUID } from '@/types/models/product/item-modifier/modifier-group'

export interface ModifierOptionComponent {
  modifierOptionComponentId: UUID
  modifierOptionId: UUID

  /** keduanya wajib saat create; saat show selalu ada */
  componentItemId: UUID
  componentUnitId: UUID | null

  /** string desimal ("0.010000") */
  quantity: DecimalString

  /** string desimal ("0.00") */
  wastagePercent: DecimalString

  // embed (opsional di response)
  componentItem?: Material
  componentUnit?: ItemUnit
}
