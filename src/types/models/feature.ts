import type Module from 'node:module'
import type { Permission } from './permission'

export interface Feature {
  featureId: string
  name: string
  isActive: boolean
  moduleId: string
  updatedAt: string
  createdAt: string

  module?: Module
  permissions?: Permission[]
}
