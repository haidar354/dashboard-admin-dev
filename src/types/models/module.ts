import type { Feature } from './feature'

export interface Module {
  moduleId: string
  name: string
  isActive: boolean
  updatedAt: string
  createdAt: string

  features?: Feature[]
}
