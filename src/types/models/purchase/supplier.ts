export interface Supplier {
  supplierId: string
  businessUnitId: string
  name: string
  address: string
  phone: string
  createdAt: string
  updatedAt: string
}

export interface SupplierForm {
  name: string
  address: string
  phone: string
}

export type SupplierFormErrors = Partial<Record<keyof SupplierForm, string>>
