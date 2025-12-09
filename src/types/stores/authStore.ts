import type { Role, User } from '../models/user'

export interface AuthStore {
  isLogin: boolean
  credentials: {
    token_type: string
    expires_in: number
    access_token: string
    refresh_token: string
  }
  abilities: Ability[]
  permissions: string[]
  roles: Role
  userData: User
}

export interface Ability {
  action: string
  subject: string
}
