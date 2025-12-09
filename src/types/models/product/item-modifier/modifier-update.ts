// ===== Utils =====
export type UUID = string
export type DecimalInput = number | string // sesuai rule 'numeric'
export type LocaleCode = string

export interface I18nEntry { name?: string; [k: string]: unknown }
export type LocalizedNameMap = Record<LocaleCode, I18nEntry>

/* ---------------------------
   Components (upsert)
--------------------------- */

// UPDATE existing component (ID ada) → semua field opsional
export interface ModifierOptionComponentUpdate {
  modifierOptionComponentId: UUID
  componentItemId?: UUID
  componentUnitId?: UUID
  quantity?: DecimalInput // > 0 jika dikirim
  wastagePercent?: DecimalInput // 0..100
}

// CREATE new component (tanpa ID) → tiga field wajib
export interface ModifierOptionComponentCreate {
  componentItemId: UUID
  componentUnitId: UUID
  quantity: DecimalInput // > 0
  wastagePercent?: DecimalInput
}

export type ModifierOptionComponentUpsert =
  | ModifierOptionComponentUpdate
  | ModifierOptionComponentCreate

/* ---------------------------
   Options (upsert)
--------------------------- */

// UPDATE existing option (ID ada) → field opsional
export interface ModifierOptionUpdate {
  modifierOptionId: UUID
  name?: string
  i18n?: LocalizedNameMap
  code?: string
  salesPrice?: number
  isDefault?: boolean
  sortOrder?: number
  isActive?: boolean

  // Kirim array untuk reconcile komponen; kalau tidak dikirim → biarkan komponen apa adanya
  components?: ModifierOptionComponentUpsert[]
}

// CREATE new option (tanpa ID) → minimal name & code & components[>=1]
export interface ModifierOptionCreate {
  name: string
  i18n?: LocalizedNameMap
  salesPrice?: number
  isDefault?: boolean
  sortOrder?: number
  isActive?: boolean

  components: ModifierOptionComponentCreate[]
}

export type ModifierOptionUpsert =
  | ModifierOptionUpdate
  | ModifierOptionCreate

/* ---------------------------
   Group (PATCH payload)
--------------------------- */

export interface ModifierGroupUpdatePayload {

  // header: semua opsional (PATCH-friendly)
  name?: string
  i18n?: LocalizedNameMap
  code?: string
  type?: string // enum di backend
  multiple?: boolean
  allowQuantity?: boolean
  minSelect?: number // jika kirim maxSelect/minSelect, jaga rule gte
  maxSelect?: number
  isActive?: boolean

  // opsional: jika dikirim → RECONCILE (yang tidak ada di array akan dihapus)
  options?: ModifierOptionUpsert[]
}

// ========= Error map =========
export type ModifierGroupUpdatePayloadErrors = Partial<Record<keyof ModifierGroupUpdatePayload, string>>
