/* eslint-disable indent */
import type {
  BomPayload,
  ItemPayload,
  ModifierPayload,
  SkuPayload,
  UnitPayload,
  VariantPayload,
  VariantUnitPayload,
} from '@/types/models/product/item-payload'

export function normalizeItemResponse(raw: any): ItemPayload {
  const parseNum = (v: unknown): number | null => {
    if (v === null || v === undefined)
      return null
    const n = Number.parseFloat(String(v))

    return Number.isNaN(n) ? null : n
  }

  // === 1️⃣ Units ===
  const units: UnitPayload[] = (raw.units || []).map((u: any): UnitPayload => ({
    itemUnitId: u.itemUnitId,
    tempId: crypto.randomUUID(),
    unitId: u.unitId,
    conversion: parseNum(u.conversion) ?? 1,
    minSalesQty: u.minSalesQty,
    isBase: !!u.isBase,
    isStock: !!u.isStock,
    isPurchase: !!u.isPurchase,
    isSales: !!u.isSales,
    isTransfer: !!u.isTransfer,
    unit: u.unit ?? null,
  }))

  const unitMap = new Map(units.map(u => [u.itemUnitId, u.tempId]))

  // === 2️⃣ Variants ===
  const variants: VariantPayload[] = (raw.variants || []).map((v: any): VariantPayload => ({
    itemVariantId: v.itemVariantId,
    tempId: v.itemVariantId, // pakai id BE untuk match
    optionsKey: v.optionsKey,
    options: Object.entries(v.options || {}).map(([axis, value]) => ({
      axis: String(axis),
      value: String(value),
    })),
    displayName: v.displayName,
    isActive: !!v.isActive,
    sortOrder: v.sortOrder ?? 0,
  }))

  const variantMap = new Map(variants.map(v => [v.itemVariantId, v.tempId]))

  // === 3️⃣ Variant Units ===
  const variantUnits: VariantUnitPayload[] = (raw.variantUnits || []).map((vu: any): VariantUnitPayload => ({
    itemVariantUnitId: vu.itemVariantUnitId,
    tempId: crypto.randomUUID(),

    // 🔹 simpan ID mentah untuk relink di initializeForm()
    itemVariantId: vu.itemVariantId ?? null,
    itemUnitId: vu.itemUnitId ?? null,

    // 🔹 langsung isi temp kalau variant/unit sudah dimap
    variantTempId: variantMap.get(vu.itemVariantId) ?? null,
    unitTempId: unitMap.get(vu.itemUnitId) ?? null,

    displayName: vu.displayName,
    isActive: !!vu.isActive,
  }))

  const variantUnitMap = new Map(variantUnits.map(vu => [vu.itemVariantUnitId, vu.tempId]))

  // === 4️⃣ SKUs ===
  const skus: SkuPayload[] = (raw.skus || []).map((s: any): SkuPayload => {
    const isVariantSku = !!s.itemVariantUnitId

    return {
      itemSkuId: s.itemSkuId,
      tempId: crypto.randomUUID(),
      displayName: s.displayName,
      code: s.code,
      barcode: s.barcode,
      isActive: !!s.isActive,

      itemVariantUnitId: isVariantSku ? s.itemVariantUnitId : null,
      variantUnitTempId: isVariantSku ? (variantUnitMap.get(s.itemVariantUnitId) ?? null) : null,
      itemUnitId: isVariantSku ? null : s.itemUnitId,
      unitTempId: isVariantSku ? null : (unitMap.get(s.itemUnitId) ?? null),

      config: {
        saleable: s.saleable ?? false,
        showInPos: s.showInPos ?? false,
        favorite: s.favorite ?? false,
        saleFulfillmentMode: s.saleFulfillmentMode ?? 'NONE',
        manufacturingSource: s.manufacturingSource ?? 'NONE',
        sourcingSitePolicy: s.sourcingSitePolicy ?? 'NONE',
        centralKitchenOutletId: s.centralKitchenOutletId ?? null,
        batchSize: parseNum(s.batchSize) ?? 1,
        leadTimeDays: s.leadTimeDays ?? 0,
        manageStock: s.manageStock ?? false,
        allowNegativeStock: s.allowNegativeStock ?? false,
        minStockAlert: s.minStockAlert ?? null,
        maxStockAlert: s.maxStockAlert ?? null,
        recipePolicy: s.recipePolicy ?? 'NONE',
      },
      cost: {
        cost: s.cost?.cost ?? 0,
        lastCost: s.cost?.lastCost ?? 0,
        method: s.cost?.method ?? 'FIFO',
      },
      price: {
        price: s.price?.price ?? 0,
        taxInclusive: s.price?.taxInclusive ?? false,
        qtyThreshold: s.price?.qtyThreshold ?? 1,
      },
      bom: null,
      overrides: [],
    }
  })

  // === 5️⃣ Outlets ===
  const outlets = (raw.itemOutlets || []).map((o: any) => ({
    outletId: o.outletId,
    isActive: !!o.isActive,
    name: o.outlet?.name ?? null,
  }))

  // === 6️⃣ Modifiers ===
  const modifiers: ModifierPayload[] = (raw.modifiers || []).map((m: any): ModifierPayload => ({
    itemModifierGroupId: m.itemModifierGroupId,
    tempId: crypto.randomUUID(),
    modifierGroupId: m.modifierGroupId,
    isActive: !!m.isActive,
    isRequired: !!m.isRequired,
    sortOrder: m.sortOrder ?? 0,
    group: m.group ?? undefined,
  }))

  // === 7️⃣ BOM (opsional) ===
  const bom: BomPayload | null = raw.salesBom
    ? {
        yield: parseNum(raw.salesBom.yield) ?? 1,
        notes: raw.salesBom.notes ?? '',
        lines: (raw.salesBom.lines || []).map((l: any): BomPayload['lines'][number] => ({
          materialItemSkuId: l.materialItemSkuId,
          quantity: parseNum(l.quantity) ?? 1,
          wastePct: parseNum(l.wastePct) ?? 0,
          consumeFromStock: !!l.consumeFromStock,
          sortOrder: l.sortOrder ?? 0,
          notes: l.notes ?? '',
        })),
      }
    : null

  // === FINAL ===
  return {
    name: raw.name,
    description: raw.description,
    kind: raw.kind,
    materialType: raw.materialType,
    itemCategoryId: raw.itemCategoryId,
    hasVariant: !!raw.hasVariant,
    hasModifier: !!raw.hasModifier,
    hasRequiredModifier: !!raw.hasRequiredModifier,
    useSameConfig: !!raw.useSameConfig,
    recipePolicy: raw.recipePolicy ?? 'NONE',
    isActive: !!raw.isActive,
    meta: raw.meta ?? {},

    config: {
      saleable: raw.saleable ?? false,
      showInPos: raw.showInPos ?? false,
      favorite: raw.favorite ?? false,
      saleFulfillmentMode: raw.saleFulfillmentMode ?? 'NONE',
      manufacturingSource: raw.manufacturingSource ?? 'NONE',
      sourcingSitePolicy: raw.sourcingSitePolicy ?? 'NONE',
      centralKitchenOutletId: raw.centralKitchenOutletId ?? null,
      batchSize: parseNum(raw.batchSize) ?? 1,
      leadTimeDays: raw.leadTimeDays ?? 0,
      manageStock: raw.manageStock ?? false,
      allowNegativeStock: raw.allowNegativeStock ?? false,
      minStockAlert: raw.minStockAlert ?? null,
      maxStockAlert: raw.maxStockAlert ?? null,
      recipePolicy: raw.recipePolicy ?? 'NONE',
    },

    outlets,
    images: (raw.images || []).map((img: any) => ({
      itemImageId: img.itemImageId,
      imageKeyOriginal: img.imageKeyOriginal,
      imageKeyMedium: img.imageKeyMedium,
      imageKeySmall: img.imageKeySmall,
      imageUrlOriginal: img.imageUrlOriginal,
      title: img.title,
      isPrimary: !!img.isPrimary,
      isActive: img.deletedAt == null,
      displayOrder: img.displayOrder ?? null,
    })),

    units,
    variants,
    variantUnits,
    skus,
    modifiers,
    bom,
  }
}
