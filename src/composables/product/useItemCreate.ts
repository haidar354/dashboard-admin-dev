import { storeToRefs } from 'pinia'
import { computed, nextTick, ref, watch } from 'vue'
import { useUnitStore } from '@/stores/global/unitStore'
import { useOutletSidebarStore } from '@/stores/outletSidebarStore'
import { useOutletStore } from '@/stores/outletStore'
import { useItemCategoryStore } from '@/stores/product/itemCategoryStore'
import { useItemStore } from '@/stores/product/itemStore'
import { useModifierStore } from '@/stores/product/modifierStore'

import { useItemSkuStore } from '@/stores/product/itemSkuStore'
import type { Outlet } from '@/types/models/outlet'
import { createBlankItemPayload } from '@/types/models/product/item-factory'
import type { ItemImage } from '@/types/models/product/item-image'
import type { ModifierGroup } from '@/types/models/product/item-modifier/modifier-group'
import type {
  BomPayload,
  ConfigPayload,
  ItemPayload,
  ModifierPayload,
  OutletPayload,
  SkuPayload,
  UnitPayload,
  VariantPayload,
  VariantUnitPayload,
} from '@/types/models/product/item-payload'

/* ---------------------------------
 * Utils
 * --------------------------------- */

const slugify = (s: string) =>
  s
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 64)

function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300): T {
  let timer: ReturnType<typeof setTimeout>

  return ((...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}

/**
 * "Kopi Hitam arabika – medium (PCS)"
 */
function buildSkuDisplayName(itemName: string, variant?: VariantPayload, unit?: UnitPayload) {
  const parts: string[] = []

  if (itemName)
    parts.push(itemName.trim())

  if (variant?.options?.length) {
    const variantLabel = variant.options
      .map(o => o.value.replace(/-/g, ' '))
      .join(' – ')

    parts.push(variantLabel)
  }

  if (unit?.unit?.code)
    parts.push(`(${unit.unit.code})`)

  return parts.join(' ').trim() || '-'
}

/**
 * "KOPI-HITAM-ARABIKA-KG"
 */
function buildSkuCode(itemName: string, variant?: VariantPayload, unit?: UnitPayload) {
  const base = slugify(itemName) // kopi-hitam

  const variantPart = variant?.options
    ?.map(o => slugify(o.value)) // arabika, medium
    .join('-')

  const unitPart = unit?.unit?.code ? slugify(unit.unit.code) : '' // kg

  return [base, variantPart, unitPart].filter(Boolean).join('-').toUpperCase()
}

/* ---------------------------------
 * Composable
 * --------------------------------- */
export function useItemCreate() {
  // === stores ===
  const itemStore = useItemStore()
  const outletStore = useOutletStore()
  const unitStore = useUnitStore()
  const categoryStore = useItemCategoryStore()
  const modifierStore = useModifierStore()
  const itemSkuStore = useItemSkuStore()
  const { selectedSidebarOutlet } = storeToRefs(useOutletSidebarStore())

  // === refs dari store ===
  const {
    createForm,
    createFormErrors,
    isLoadingCreate,
  } = storeToRefs(itemStore)

  const { data: units, isLoadingFetchData: isLoadingUnits } = storeToRefs(unitStore)
  const { data: outlets, isLoadingFetchData: isLoadingOutlets } = storeToRefs(outletStore)
  const { data: itemCategories, isLoadingFetchData: isLoadingCategories } = storeToRefs(categoryStore)
  const { data: modifiers, isLoadingFetchData: isLoadingModifiers } = storeToRefs(modifierStore)
  const { data: materials, isLoadingFetchData: isLoadingMaterials } = storeToRefs(itemSkuStore)

  // UI state
  const selectedModifiers = ref<ModifierGroup[]>([])

  // Variant builder state (belum dikirim ke BE langsung)
  const variantGroups = ref<
    {
      tempId: string
      name: string
      options: { tempId: string; name: string; isActive: boolean }[]
    }[]
  >([])

  /* ---------------------------------
   * Global config sync (useSameConfig)
   * --------------------------------- */

  // kalau globalConfig berubah, dan user pakai "sama semua", push ke semua sku
  watch(
    [createForm.value.config, () => createForm.value.useSameConfig],
    ([cfg, same]) => {
      if (!same)
        return

      createForm.value.skus.forEach(sku => {
        sku.config = { ...cfg }
      })
    },
    { deep: true },
  )

  // kalau user toggle useSameConfig -> true, langsung samain semua SKU
  watch(
    () => createForm.value.useSameConfig,
    same => {
      if (!same)
        return
      createForm.value.skus.forEach(sku => {
        sku.config = { ...createForm.value.config }
      })
    },
  )

  /** btn helper: apply global config ⇢ semua sku */
  const applyGlobalConfigToAll = () => {
    createForm.value.skus.forEach(sku => {
      sku.config = { ...createForm.value.config }
    })
  }

  /** derive global config dari kumpulan sku (buat edit mode nanti) */
  const deriveGlobalConfig = (skus: SkuPayload[]): ConfigPayload => {
    if (!skus.length)
      return { ...createForm.value.config }

    const base = { ...skus[0].config }

    for (const sku of skus) {
      for (const key in base) {
        if (sku.config?.[key as keyof ConfigPayload] !== base[key as keyof ConfigPayload]) {
          ;(base as any)[key] = undefined
        }
      }
    }

    return base
  }

  /** reset satu sku ⇢ balik ikut global */
  const resetSkuToGlobal = (sku: SkuPayload) => {
    sku.config = { ...createForm.value.config }
  }

  /* ---------------------------------
   * Derived data
   * --------------------------------- */

  const outletsData = computed<OutletPayload[]>(() =>
    (outlets.value || []).map(o => ({
      outletId: o.outletId,
      isActive: true,
      sortOrder: null,
      name: o.name,
    })),
  )

  const defaultUnit = computed<UnitPayload | undefined>(() => {
    return createForm.value.units?.find(u => u.isBase)
  })

  /* ---------------------------------
   * Factories
   * --------------------------------- */

  const makeOutlet = (outlet: Outlet): OutletPayload => ({
    outletId: outlet.outletId,
    isActive: true,
    name: outlet.name,
  })

  const makeUnit = (isBase = false): UnitPayload => ({
    tempId: crypto.randomUUID(),
    unitId: '',
    conversion: 1,
    minSalesQty: 1,
    isBase,
    isStock: isBase,
    isPurchase: isBase,
    isSales: isBase,
    isTransfer: isBase,
  })

  const makeSku = (): SkuPayload => ({
    tempId: crypto.randomUUID(),
    displayName: '',
    code: '',
    barcode: '',
    isActive: true,
    unitTempId: undefined,
    variantUnitTempId: undefined,
    config: { ...createForm.value.config },
    cost: { cost: 0 },
    price: { price: 0 },
    bom: { yield: 1, lines: [] },
    overrides: [],
  })

  const makeVariant = (): VariantPayload => ({
    tempId: crypto.randomUUID(),
    optionsKey: '',
    options: [],
    displayName: '',
    isActive: true,
    sortOrder: 0,
  })

  const makeVariantUnit = (): VariantUnitPayload => ({
    tempId: crypto.randomUUID(),
    variantTempId: '',
    unitTempId: '',
    displayName: '',
    isActive: true,
  })

  const makeImage = (): ItemImage => ({
    itemImageId: crypto.randomUUID(),
    imageKeyOriginal: '',
    imageKeyMedium: null,
    imageKeySmall: null,
    imageUrlOriginal: '',
    title: null,
    isPrimary: false,
    isActive: true,
  })

  const makeModifier = (): ModifierPayload => ({
    tempId: crypto.randomUUID(),
    modifierGroupId: '',
    isActive: true,
    isRequired: false,
    sortOrder: (createForm.value.modifiers?.length || 0) + 1,
  })

  const makeBom = (): BomPayload => ({
    yield: 1,
    notes: '',
    lines: [],
  })

  /* ---------------------------------
   * SKU regeneration logic
   * --------------------------------- */

  const regenerateSkus = debounce(() => {
    const itemUnits = createForm.value.units || []
    const variants = createForm.value.variants || []
    const hasVariant = createForm.value.hasVariant
    const newSkus: SkuPayload[] = []

    // case: TANPA VARIAN → 1 SKU per unit
    if (!hasVariant || !variants.length) {
      for (const u of itemUnits) {
        newSkus.push({
          tempId: crypto.randomUUID(),
          displayName: buildSkuDisplayName(createForm.value.name, undefined, u),
          code: buildSkuCode(createForm.value.name, undefined, u),
          barcode: '',
          isActive: true,
          unitTempId: u.tempId, // penting buat BE (XOR)
          variantUnitTempId: undefined,
          config: { ...createForm.value.config },
          cost: { cost: 0 },
          price: { price: 0 },
          bom: { yield: 1, lines: [] },
          overrides: [],
        })
      }
    }

    // case: ADA VARIAN → SKU per kombinasi (variant x unit)
    else {
      for (const v of variants) {
        for (const u of itemUnits) {
          // cari variant-unit yang cocok antara variant dan unit
          const matchedVarUnit = createForm.value.variantUnits?.find(
            vu => vu.variantTempId === v.tempId && vu.unitTempId === u.tempId,
          )

          newSkus.push({
            tempId: crypto.randomUUID(),
            displayName: buildSkuDisplayName(createForm.value.name, v, u),
            code: buildSkuCode(createForm.value.name, v, u),
            barcode: '',
            isActive: true,
            variantUnitTempId: matchedVarUnit?.tempId, // ✅ ini yang benar
            unitTempId: undefined, // SKU berbasis varUnit, jadi tidak pakai itemUnit langsung
            config: { ...createForm.value.config },
            cost: { cost: 0 },
            price: { price: 0 },
            bom: { yield: 1, lines: [] },
            overrides: [],
          })
        }
      }
    }

    createForm.value.skus = newSkus
  }, 250)

  // auto regenerate saat faktor penentu berubah
  watch(
    [
      () => createForm.value.units,
      () => createForm.value.hasVariant,
      () => createForm.value.variants,
      () => createForm.value.name,
    ],
    regenerateSkus,
    { deep: true },
  )

  /* ---------------------------------
   * init form
   * --------------------------------- */
  const initializeForm = async () => {
    await outletStore.fetchAllData()

    const basePayload = createBlankItemPayload()

    // pilih default outlet: current sidebar outlet kalau ada, else semua
    let defaultOutlets: OutletPayload[] = []
    if (selectedSidebarOutlet.value?.outletId)
      defaultOutlets = [makeOutlet(selectedSidebarOutlet.value)]

    else if (outlets.value)
      defaultOutlets = outlets.value.map(makeOutlet)

    // seed form utama
    createForm.value = {
      ...basePayload,
      kind: 'product',
      recipePolicy: 'NONE',
      outlets: defaultOutlets,
      images: [],
      units: [makeUnit(true)],
      skus: [],
      variants: [],
      variantUnits: [],
      modifiers: [],
      bom: null,
    } as ItemPayload

    // seed global config (dipakai semua SKU awal)
    createForm.value.config = {
      saleable: false,
      showInPos: false,
      favorite: false,
      saleFulfillmentMode: 'NONE',
      manufacturingSource: 'NONE',
      sourcingSitePolicy: 'NONE',
      centralKitchenOutletId: null,
      batchSize: null,
      leadTimeDays: null,
      manageStock: false,
      allowNegativeStock: false,
      minStockAlert: null,
      maxStockAlert: null,
      recipePolicy: 'NONE',
    }

    await Promise.all([
      unitStore.fetchAllData(),
      categoryStore.fetchAllData(),
      modifierStore.fetchAllData({ include: ['options'] }),
      itemSkuStore.fetchAllData({
        manageStock: true,
      }), // kalau ada
    ])
  }

  const generateVariantUnits = () => {
    const variants = createForm.value.variants || []
    const itemUnits = createForm.value.units || []
    const newVariantUnits: VariantUnitPayload[] = []

    for (const v of variants) {
      for (const u of itemUnits) {
        newVariantUnits.push({
          tempId: crypto.randomUUID(),
          variantTempId: v.tempId,
          unitTempId: u.tempId,
          displayName: buildSkuDisplayName(createForm.value.name, v, u),
          isActive: true,
        })
      }
    }

    createForm.value.variantUnits = newVariantUnits
  }

  /* ---------------------------------
   * Variant generation (dari variantGroups UI → createForm.variants)
   * --------------------------------- */
  const generateVariants = debounce(() => {
    if (!variantGroups.value.length) {
      createForm.value.variants = []
      regenerateSkus()

      return
    }

    type AttrMap = Record<string, string>
    let acc: AttrMap[] = [{}]

    for (const group of variantGroups.value) {
      const groupKey = slugify(group.name || 'group')
      const activeOptions = group.options.filter(o => o.isActive && o.name.trim())
      const next: AttrMap[] = []

      for (const base of acc) {
        for (const opt of activeOptions) {
          next.push({
            ...base,
            [groupKey]: slugify(opt.name),
          })
        }
      }

      acc = next
    }

    createForm.value.variants = acc.map((attrs, i): VariantPayload => ({
      tempId: crypto.randomUUID(),
      optionsKey: Object.entries(attrs)
        .map(([axis, value]) => `${axis}:${value}`)
        .join('|'),
      options: Object.entries(attrs).map(([axis, value]) => ({ axis, value })),
      displayName: Object.values(attrs)
        .map(v => v.replace(/-/g, ' '))
        .join(' - '),
      isActive: true,
      sortOrder: i + 1,
    }))

    generateVariantUnits()
    regenerateSkus()
  }, 250)

  watch(variantGroups, generateVariants, { deep: true })

  /* ---------------------------------
   * public methods (UI actions)
   * --------------------------------- */

  const addSku = () => {
    createForm.value.skus.push(makeSku())
  }

  const removeSku = (i: number) => {
    createForm.value.skus.splice(i, 1)
  }

  const addOutlet = (outlet: Outlet) => {
    if (!createForm.value.outlets.find(o => o.outletId === outlet.outletId))
      createForm.value.outlets.push(makeOutlet(outlet))
  }

  const removeOutlet = (outletId: string) => {
    createForm.value.outlets = createForm.value.outlets.filter(o => o.outletId !== outletId)
  }

  const addUnit = () => {
    createForm.value.units.push(makeUnit())
  }

  const removeUnit = (i: number) => {
    createForm.value.units.splice(i, 1)
  }

  const onChangeUnit = async (i: number) => {
    await nextTick()

    const chosenUnitId = createForm.value.units[i].unit?.unitId
    if (chosenUnitId) {
      // sinkronkan unitId, tapi simpan full unit object buat display
      createForm.value.units[i].unitId = chosenUnitId
      regenerateSkus()
    }
  }

  const addBlankVariantGroup = () => {
    variantGroups.value.push({
      tempId: crypto.randomUUID(),
      name: '',
      options: [
        {
          tempId: crypto.randomUUID(),
          name: '',
          isActive: true,
        },
      ],
    })
  }

  const removeVariantGroup = (i: number) => {
    variantGroups.value.splice(i, 1)
    generateVariants()
  }

  const addBlankVariantGroupOption = (groupIndex: number) => {
    variantGroups.value[groupIndex].options.push({
      tempId: crypto.randomUUID(),
      name: '',
      isActive: true,
    })
  }

  const removeVariantGroupOption = (groupIndex: number, optionIndex: number) => {
    variantGroups.value[groupIndex].options.splice(optionIndex, 1)
    generateVariants()
  }

  const addVariant = () => {
    createForm.value.variants?.push(makeVariant())
  }

  const removeVariant = (i: number) => {
    createForm.value.variants?.splice(i, 1)
  }

  const addVariantUnit = () => {
    createForm.value.variantUnits?.push(makeVariantUnit())
  }

  const removeVariantUnit = (i: number) => {
    createForm.value.variantUnits?.splice(i, 1)
  }

  watch(
    () => createForm.value.hasVariant,
    hasVariant => {
      if (hasVariant && !variantGroups.value.length)
        addBlankVariantGroup()
      else variantGroups.value = []
    },
    { deep: true },
  )

  const addImage = () => {
    createForm.value.images?.push(makeImage())
  }

  const removeImage = (i: number) => {
    createForm.value.images?.splice(i, 1)
  }

  const addModifier = () => {
    createForm.value.modifiers?.push(makeModifier())
  }

  const removeModifier = (i: number) => {
    createForm.value.modifiers?.splice(i, 1)
  }

  const enableBom = () => {
    if (!createForm.value.bom) {
      createForm.value.bom = makeBom()

      createForm.value.bom!.lines.push({
        materialItemSkuId: '',
        quantity: 0,
        wastePct: 0,
        consumeFromStock: true,
        sortOrder: (createForm.value.bom?.lines.length || 0) + 1,
        notes: '',
      })
    }
  }

  const disableBom = () => {
    createForm.value.bom = null
  }

  const addBomLine = () => {
    if (!createForm.value.bom)
      enableBom()

    createForm.value.bom!.lines.push({
      materialItemSkuId: '',
      quantity: 1,
      wastePct: 0,
      consumeFromStock: true,
      sortOrder: (createForm.value.bom?.lines.length || 0) + 1,
      notes: '',
    })
  }

  const removeBomLine = (i: number) => {
    createForm.value.bom?.lines.splice(i, 1)
  }

  /* ---------------------------------
   * expose
   * --------------------------------- */
  return {
    // state
    createForm,
    createFormErrors,
    isLoadingCreate,

    selectedModifiers,
    variantGroups,

    // lookup data
    outletsData,
    units,
    itemCategories,
    modifiers,
    materials,

    // loading flags
    isLoadingOutlets,
    isLoadingUnits,
    isLoadingCategories,
    isLoadingModifiers,
    isLoadingMaterials,

    // derived
    defaultUnit,

    // helpers / lifecycle
    initializeForm,
    applyGlobalConfigToAll,
    resetSkuToGlobal,
    deriveGlobalConfig,

    // entity handlers
    addOutlet,
    removeOutlet,

    addUnit,
    removeUnit,
    onChangeUnit,

    addVariant,
    removeVariant,
    addVariantUnit,
    removeVariantUnit,

    addSku,
    removeSku,

    addImage,
    removeImage,

    addModifier,
    removeModifier,

    addBlankVariantGroup,
    removeVariantGroup,
    addBlankVariantGroupOption,
    removeVariantGroupOption,

    generateVariants,

    enableBom,
    disableBom,
    addBomLine,
    removeBomLine,
  }
}
