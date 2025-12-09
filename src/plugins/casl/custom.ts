import { can } from '@layouts/plugins/casl'
import type { Rule } from './ability'

export const isCanAccessRoute = (rules: Rule[]): boolean => {
  // If no rules defined, allow access
  if (!rules || rules.length === 0)
    return true

  // Check if user can access any of the rules
  // Also check for 'default' or 'all' permission which grants access to everything
  return rules.some(element => {
    // Check direct permission
    if (can(element.action, element.subject))
      return true

    // Check if user has 'default' or 'all' permission (grants access to all admin pages)
    if (can('manage', 'default') || can('manage', 'all'))
      return true

    return false
  })
}
