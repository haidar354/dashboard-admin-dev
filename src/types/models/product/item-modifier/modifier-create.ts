// ===== Utils =====
export interface I18nEntry {
  name?: string

  // boleh ada field lain jika perlu
  [k: string]: unknown
}
export type LocalizedNameMap = Record<string, I18nEntry>

// ===== Payload: Create Modifier Group =====
export interface ModifierOptionComponentCreate {

  /** REQUIRED saat create */
  componentItemId: string

  /** REQUIRED saat create */
  componentUnitId: string

  /** REQUIRED saat create, > 0 */
  quantity: number

  /** 0..100 (opsional) */
  wastagePercent?: number
}

export interface ModifierOptionCreate {

  /** REQUIRED */
  name: string
  i18n?: LocalizedNameMap

  /** numeric; boleh 0 */
  salesPrice?: number

  /** > 0 jika dikirim */
  quantityScale?: number

  isDefault?: boolean
  sortOrder?: number
  isActive?: boolean
  hasComponent?: boolean

  /** REQUIRED, minimal 1 */
  components: ModifierOptionComponentCreate[]
}

export interface ModifierGroupCreatePayload {

  /** REQUIRED */
  name: string
  i18n?: LocalizedNameMap

  /** REQUIRED */
  code?: string

  /** REQUIRED (enum backend, pakai string agar fleksibel: "extra", "choice", "addon", dll) */
  type: string

  /** REQUIRED */
  multiple: boolean

  /** optional */
  allowQuantity?: boolean

  /** direkomendasikan kirim keduanya; backend men-validate gte:minSelect */
  minSelect?: number
  maxSelect?: number

  isActive?: boolean

  /** REQUIRED, minimal 1 */
  options: ModifierOptionCreate[]
}

// ========= Error map =========
export type ModifierGroupCreatePayloadErrors = Partial<Record<keyof ModifierGroupCreatePayload, string>>
