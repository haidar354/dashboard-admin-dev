import type { ItemPayload } from '@/types/models/product/item-payload'

export function createBlankItemPayload(): ItemPayload {
  return {
    name: '',
    kind: 'product',
    materialType: null,
    itemCategoryId: null,
    description: '',
    hasVariant: false,
    hasModifier: false,
    hasRequiredModifier: false,
    useSameConfig: true,
    recipePolicy: 'NONE',
    isActive: true,
    meta: {},

    config: {
      saleable: false,
      showInPos: false,
      favorite: false,

      saleFulfillmentMode: null,
      manufacturingSource: null,
      sourcingSitePolicy: null,
      centralKitchenOutletId: null,
      batchSize: null,
      leadTimeDays: null,

      manageStock: false,
      allowNegativeStock: false,
      minStockAlert: null,
      maxStockAlert: null,

      recipePolicy: 'NONE',
    },

    outlets: [],
    images: [],
    units: [],
    skus: [],
    variants: [],
    variantUnits: [],
    modifiers: [],
    bom: null,
  }
}
