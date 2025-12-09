import { storeToRefs } from 'pinia'
import { useUnitStore } from '@/stores/global/unitStore'
import { useMaterialStore } from '@/stores/inventory/materialStore'
import { useOutletSidebarStore } from '@/stores/outletSidebarStore'
import { useItemCategoryStore } from '@/stores/product/itemCategoryStore'
import type { Unit } from '@/types/models/product/unit/unit'

export function useMaterialCreate() {
  const materialStore = useMaterialStore()
  const outletStore = useOutletSidebarStore()
  const unitStore = useUnitStore()
  const itemCategoryStore = useItemCategoryStore()

  // Store refs
  const { createForm, createFormErrors, isLoadingCreate } = storeToRefs(materialStore)
  const { data: outlets, selectedSidebarOutlet, isLoadingFetchData: isLoadingFetchDataOutlets } = storeToRefs(outletStore)
  const { data: itemCategories, isLoadingFetchData: isLoadingFetchDataItemCategories } = storeToRefs(itemCategoryStore)
  const { data: units, isLoadingFetchData: isLoadingFetchDataUnits } = storeToRefs(unitStore)

  // computed
  const defaultUnit = computed(() => {
    return createForm.value.itemUnits.find(unit => unit.isBase) || createForm.value.itemUnits[0]
  })

  // store methods
  const { create } = materialStore

  // Methods
  const initializeForm = async () => {
    createForm.value = {
      materialType: 'raw',
      isActive: true,
      name: '',
      itemCategoryId: '',
      outletIds: selectedSidebarOutlet.value?.outletId ? [selectedSidebarOutlet.value.outletId] : [],
      useSameConfig: true,
      itemConfigs: [{
        outletId: undefined,
        isActive: true,
        showInPos: true,
        isFavorite: false,
        manageStock: true,
        minStockAlert: 0,
        allowNegativeStock: false,
        cashierMaxPriceChangePct: 0,
      }],
      itemUnits: [{
        unitId: '',
        sku: '',
        barcode: '',
        isBase: true,
        isStock: true,
        isPurchase: true,
        isSales: true,
        isTransfer: true,
        conversion: 1,
        itemCosts: [{ outletId: undefined, cost: 0 }],
        itemPrices: [{ outletId: undefined, price: 0 }],
        unit: undefined,
      }],
    }

    await Promise.all([
      outletStore.fetchAllData(),
      itemCategoryStore.fetchAllData(),
      unitStore.fetchAllData(),
    ])
  }

  // unit methods
  const addNewBlankUnit = (conversion: number) => {
    createForm.value.itemUnits?.push({
      unitId: '',
      sku: '',
      barcode: '',
      isBase: false,
      isStock: false,
      isPurchase: false,
      isSales: false,
      isTransfer: false,
      conversion,
      itemCosts: createForm.value.useSameConfig ? [{ outletId: undefined, cost: 0 }] : createForm.value.outletIds.map(oid => ({ outletId: oid, cost: 0 })),
      itemPrices: createForm.value.useSameConfig ? [{ outletId: undefined, price: 0 }] : createForm.value.outletIds.map(oid => ({ outletId: oid, price: 0 })),
      unit: undefined,
    })
  }

  const removeUnit = (index: number) => {
    createForm.value.itemUnits?.splice(index, 1)
  }

  const addUnitIfNotExists = () => {
    if (createForm.value.itemUnits?.length === 0)
      addNewBlankUnit(1)
  }

  const onUnitChange = async (unitList: Unit[], index: number) => {
    await nextTick()
    createForm.value.itemUnits[index].unit = unitList.find(u => u.unitId === createForm.value.itemUnits[index].unitId)
  }

  return {
    // State
    createForm,
    createFormErrors,
    isLoadingCreate,
    outlets,
    isLoadingFetchDataOutlets,
    itemCategories,
    isLoadingFetchDataItemCategories,
    units,
    isLoadingFetchDataUnits,
    defaultUnit,

    // Methods
    create,
    initializeForm,

    // unit methods
    addNewBlankUnit,
    removeUnit,
    addUnitIfNotExists,
    onUnitChange,
  }
}
