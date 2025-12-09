export interface Role {
  id: string
  team_id?: string
  name: string
  guard_name: string
  updated_at: string
  created_at: string
}

export interface RoleForm {
  name: string
}

export type RoleFormErrors = Partial<Record<keyof RoleForm, string>>
