export interface AdminSubscription {
  id: string
  companyId: string
  companyName: string
  planId: string
  planName: string
  status: 'active' | 'trial' | 'expired' | 'cancelled' | 'pending'
  startDate: string
  endDate: string
  trialEndDate?: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  autoRenew: boolean
  cancelledAt?: string
  cancelReason?: string
  createdAt: string
  updatedAt: string
}

export interface AdminSubscriptionForm {
  companyId: string
  planId: string
  billingCycle: 'monthly' | 'yearly'
  autoRenew: boolean
}

export type AdminSubscriptionFormErrors = Partial<Record<keyof AdminSubscriptionForm, string>>
