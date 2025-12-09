import type { Rule } from '@/plugins/casl/ability'
import type { Role } from '@/types/models/role'

export const getUserRoles = () => {
  const storedData = localStorage.getItem('authStore')

  return storedData ? (JSON.parse(storedData).roles as Role[]) : null
}

export const getUserAbilities: () => Rule[] = () => {
  try {
    const storedData = localStorage.getItem('authStore')
    if (storedData)
      return JSON.parse(storedData).abilities as Rule[]
  }
  catch (error) {
    console.error('Error parsing abilities from local storage:', error)
  }

  return []
}
