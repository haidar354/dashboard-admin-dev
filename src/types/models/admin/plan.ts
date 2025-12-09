export interface AdminPlan {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  features: string[]
  limits: {
    maxUsers: number
    maxOutlets: number
    maxBusinessUnits: number
    maxProducts: number
    maxTransactions: number
  }
  isActive: boolean
  isPopular: boolean
  subscriberCount: number
  createdAt: string
  updatedAt: string
}

export interface AdminPlanForm {
  name: string
  slug: string
  description?: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  features: string[]
  limits: {
    maxUsers: number
    maxOutlets: number
    maxBusinessUnits: number
    maxProducts: number
    maxTransactions: number
  }
  isActive: boolean
  isPopular: boolean
}

export type AdminPlanFormErrors = Partial<Record<keyof AdminPlanForm, string>>
