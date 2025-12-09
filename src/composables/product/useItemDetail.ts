import { storeToRefs } from 'pinia'
import { useUnitStore } from '@/stores/global/unitStore'
import { useOutletStore } from '@/stores/outletStore'
import { useItemCategoryStore } from '@/stores/product/itemCategoryStore'
import { useItemStore } from '@/stores/product/itemStore'
import type { ItemUnitView } from '@/types/models/product/item'

export function useItemDetail() {
  const itemStore = useItemStore()
  const outletStore = useOutletStore()
  const unitStore = useUnitStore()
  const itemCategoryStore = useItemCategoryStore()

  // Store refs
  const { selectedItemDetail, isLoadingFetchDetail } = storeToRefs(itemStore)
  const { data: outlets, isLoadingFetchData: isLoadingFetchDataOutlets } = storeToRefs(outletStore)
  const { data: itemCategories, isLoadingFetchData: isLoadingFetchDataItemCategories } = storeToRefs(itemCategoryStore)
  const { data: units, isLoadingFetchData: isLoadingFetchDataUnits } = storeToRefs(unitStore)

  // computed
  const defaultUnit = computed((): ItemUnitView | undefined => {
    return selectedItemDetail?.value?.itemUnits?.find(itemUnit => itemUnit.isBase) || undefined
  })

  // store methods
  const { fetchDetail, onDeleteItem } = itemStore

  // Methods
  const initializeDetailData = async (itemId: string, useSameConfig: boolean) => {
    let includes: string[] = []
    if (useSameConfig) {
      includes = [
        'itemOutlets.outlet',
        'itemOutlets.itemSkuOverride',
        'images',
        'category',
        'units.unit',

        'skus',
        'skus.cost',
        'skus.price',
        'modifiers',
      ]
    }
    else {
      includes = [
        'itemOutlets.outlet',
        'itemOutlets.itemSkuOverride',
        'images',
        'category',
        'units.unit',

        'skus.configs',
        'skus.costs',
        'skus.prices',
        'modifiers',
      ]
    }
    fetchDetail(itemId, {
      include: includes,
    }).then(response => {
      selectedItemDetail.value = response.data
    })
  }

  return {
    // State
    selectedItemDetail,
    isLoadingFetchDetail,
    outlets,
    isLoadingFetchDataOutlets,
    itemCategories,
    isLoadingFetchDataItemCategories,
    units,
    isLoadingFetchDataUnits,
    defaultUnit,

    // Methods
    initializeDetailData,
    onDeleteItem,

  }
}
