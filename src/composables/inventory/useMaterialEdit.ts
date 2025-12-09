/* eslint-disable @stylistic/ts/indent */
import { storeToRefs } from 'pinia'
import { useUnitStore } from '@/stores/global/unitStore'
import { useMaterialStore } from '@/stores/inventory/materialStore'
import { useOutletStore } from '@/stores/outletStore'
import { useItemCategoryStore } from '@/stores/product/itemCategoryStore'
import type { Material } from '@/types/models/inventory/material'
import type { Unit } from '@/types/models/product/unit/unit'

export function useMaterialEdit() {
  const materialStore = useMaterialStore()
  const outletStore = useOutletStore()
  const unitStore = useUnitStore()
  const itemCategoryStore = useItemCategoryStore()

  // Store refs
  const { editForm, editFormErrors, isLoadingFetchDetail } = storeToRefs(materialStore)
  const { data: outlets, isLoadingFetchData: isLoadingFetchDataOutlets } = storeToRefs(outletStore)
  const { data: itemCategories, isLoadingFetchData: isLoadingFetchDataItemCategories } = storeToRefs(itemCategoryStore)
  const { data: units, isLoadingFetchData: isLoadingFetchDataUnits } = storeToRefs(unitStore)

  // computed
  const defaultUnit = computed(() => {
    return editForm.value.itemUnits.find(unit => unit.isBase) || editForm.value.itemUnits[0]
  })

  // store methods
  const { fetchDetail, update } = materialStore

  // Methods
  const initializeForm = async (data: Material) => {
    editForm.value = {
      materialType: data.materialType,
      isActive: data.isActive,
      name: data.name,
      description: data.description,
      itemCategoryId: data.itemCategoryId,
      outletIds: data.outlets?.map(outlet => outlet.outletId) || [],
      useSameConfig: data.useSameConfig,
      itemConfigs: data.useSameConfig
        ? [{
          outletId: undefined as string | undefined,
          isActive: data.itemConfigs?.[0]?.isActive || true,
          showInPos: data.itemConfigs?.[0]?.showInPos || true,
          isFavorite: data.itemConfigs?.[0]?.isFavorite || false,
          manageStock: data.itemConfigs?.[0]?.manageStock || true,
          minStockAlert: data.itemConfigs?.[0]?.minStockAlert || 0,
          allowNegativeStock: data.itemConfigs?.[0]?.allowNegativeStock || false,
          cashierMaxPriceChangePct: data.itemConfigs?.[0]?.cashierMaxPriceChangePct || 0,
        }]
        : data.itemConfigs?.map(config => ({
          outletId: config.outletId,
          isActive: config.isActive,
          showInPos: config.showInPos,
          isFavorite: config.isFavorite,
          manageStock: config.manageStock,
          minStockAlert: config.minStockAlert,
          allowNegativeStock: config.allowNegativeStock,
          cashierMaxPriceChangePct: config.cashierMaxPriceChangePct,
        })) || [{
          outletId: undefined,
          isActive: true,
          showInPos: true,
          isFavorite: false,
          manageStock: true,
          minStockAlert: 0,
          allowNegativeStock: false,
          cashierMaxPriceChangePct: 0,
        }],
      itemUnits: data.itemUnits?.map(unit => {
        return {
          itemUnitId: unit.itemUnitId,
          unitId: unit.unitId,
          sku: unit.itemSku?.identifier || '',
          barcode: unit.itemBarcode?.identifier || '',
          isBase: unit.isBase,
          isStock: unit.isStock,
          isPurchase: unit.isPurchase,
          isSales: unit.isSales,
          isTransfer: unit.isTransfer,
          conversion: Number(unit.conversion) || 1,
          itemCosts: data.useSameConfig
            ? [{ outletId: undefined, cost: Number(unit.itemCost?.cost) || 0 }]
            : unit.itemCosts?.map(cost => ({
              outletId: cost.outletId,
              cost: Number(cost.cost),
            })) || [{ outletId: undefined, cost: 0 }],
          itemPrices: data.useSameConfig
            ? [{ outletId: undefined, price: Number(unit.itemPrice?.price) || 0 }]
            : unit.itemPrices?.map(price => ({
              outletId: price.outletId,
              price: Number(price.price),
            })) || [{ outletId: undefined, price: 0 }],
          unit: units.value.find(u => u.unitId === unit.unitId),
        }
      }) || [{
        itemUnitId: '',
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

  const initializeEditData = async (materialId: string) => {
    fetchDetail(materialId, {
      include: [
        'itemCategory',
        'outlets',
        'itemUnits.itemCost',
        'itemUnits.itemPrice',
        'itemUnits.itemSku',
        'itemUnits.itemBarcode',
        'itemConfigs',
      ],
    }).then(response => {
      initializeForm(response.data)
    })
  }

  const saveForm = async (materialId: string) => {
    await update(materialId).then(() => {
      setTimeout(() => {
        initializeForm({} as Material)
      }, 1000)
    }).catch((err: any) => {
      throw err
    })
  }

  // unit methods
  const addNewBlankUnit = (conversion: number) => {
    editForm.value.itemUnits?.push({
      unitId: '',
      sku: '',
      barcode: '',
      isBase: false,
      isStock: false,
      isPurchase: false,
      isSales: false,
      isTransfer: false,
      conversion,
      itemCosts: editForm.value.useSameConfig ? [{ outletId: undefined, cost: 0 }] : editForm.value.outletIds.map(oid => ({ outletId: oid, cost: 0 })),
      itemPrices: editForm.value.useSameConfig ? [{ outletId: undefined, price: 0 }] : editForm.value.outletIds.map(oid => ({ outletId: oid, price: 0 })),
      unit: undefined,
    })
  }

  const removeUnit = (index: number) => {
    editForm.value.itemUnits?.splice(index, 1)
  }

  const addUnitIfNotExists = () => {
    if (editForm.value.itemUnits?.length === 0)
      addNewBlankUnit(1)
  }

  const onUnitChange = async (unitList: Unit[], index: number) => {
    await nextTick()
    editForm.value.itemUnits[index].unit = unitList.find(u => u.unitId === editForm.value.itemUnits[index].unitId)
  }

  return {
    // State
    editForm,
    editFormErrors,
    isLoadingFetchDetail,
    outlets,
    isLoadingFetchDataOutlets,
    itemCategories,
    isLoadingFetchDataItemCategories,
    units,
    isLoadingFetchDataUnits,
    defaultUnit,

    // Methods
    saveForm,
    initializeEditData,

    // unit methods
    addNewBlankUnit,
    removeUnit,
    addUnitIfNotExists,
    onUnitChange,

  }
}
