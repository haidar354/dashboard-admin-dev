export interface UserAccount {
  userId: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
  status: string
  createdAt: string
  isOwner: boolean
  isManager: boolean
  isEmployee: boolean
  isCashier: boolean
  platform: string
  businessUnitId: string
  outletId: string | null
  role: string | null
}

export interface UserAccountForm {
  email?: string
  name?: string
  phone?: string
  avatar?: File | string
}

export type UserAccountFormErrors = Partial<Record<keyof UserAccountForm, string>>

export interface ChangePasswordForm {
  oldPassword: string
  newPassword: string
  newPasswordConfirmation: string
}

export type ChangePasswordFormErrors = Partial<Record<keyof ChangePasswordForm, string>>
