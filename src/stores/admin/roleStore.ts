// Admin Role Store (IAM Roles)
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

import type { RequestQueryModel } from '@/types/api/request'
import type { PaginateData } from '@/types/api/response'
import type { Role, RoleForm, RoleFormErrors } from '@/types/models/role'
import { showToast } from '@/utils/toaster'

export const useAdminRoleStore = defineStore('adminRoleStore', {
  state: () => ({
    paginateData: {
      data: [],
      meta: {
        from: 0,
        to: 0,
        total: 0,
        perPage: 10,
        currentPage: 1,
        lastPage: 1,
      },
    } as PaginateData<Role>,
    roles: [] as Role[],
    selectedRole: null as Role | null,
    isLoading: false,
    isLoadingSubmit: false,
    isLoadingDelete: false,
    requestQuery: {
      page: 1,
      perPage: 10,
      search: '',
    } as RequestQueryModel,
    form: {
      name: '',
    } as RoleForm,
    formErrors: {} as RoleFormErrors,
    dialogVisible: false,
    dialogMode: 'create' as 'create' | 'edit',
    deleteDialogVisible: false,
  }),

  actions: {
    async fetchRoles() {
      this.isLoading = true
      try {
        // Simulate API delay while backend endpoint is being prepared
        await new Promise(resolve => setTimeout(resolve, 300))

        let filteredData = [...this.roles]

        // Apply search filter
        if (this.requestQuery.search) {
          const search = this.requestQuery.search.toLowerCase()

          filteredData = filteredData.filter(r =>
            r.name.toLowerCase().includes(search)
            || r.guard_name.toLowerCase().includes(search),
          )
        }

        const total = filteredData.length
        const perPage = this.requestQuery.perPage || 10
        const page = this.requestQuery.page || 1
        const start = (page - 1) * perPage
        const end = start + perPage

        this.paginateData = {
          data: filteredData.slice(start, end),
          meta: {
            from: total === 0 ? 0 : start + 1,
            to: Math.min(end, total),
            total,
            perPage,
            currentPage: page,
            lastPage: Math.max(1, Math.ceil(total / perPage)),
          },
        }
      }
      catch (error) {
        console.error('Error fetching roles:', error)
        showToast('Gagal memuat data roles', 'error')
      }
      finally {
        this.isLoading = false
      }
    },

    openDialog(mode: 'create' | 'edit', role?: Role) {
      this.dialogMode = mode
      if (role) {
        this.selectedRole = role
        this.form = {
          name: role.name,
        }
      }
      else {
        this.resetForm()
      }

      this.dialogVisible = true
    },

    closeDialog() {
      this.dialogVisible = false
      this.resetForm()
    },

    resetForm() {
      this.form = {
        name: '',
      }
      this.formErrors = {}
      this.selectedRole = null
    },

    async createRole() {
      this.isLoadingSubmit = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))

        const now = new Date().toISOString()

        const newRole: Role = {
          id: uuidv4(),
          name: this.form.name,
          guard_name: 'web',
          created_at: now,
          updated_at: now,
        }

        this.roles.unshift(newRole)
        showToast('Role berhasil dibuat', 'success')
        this.dialogVisible = false
        this.resetForm()
        await this.fetchRoles()
      }
      catch (error) {
        console.error('Error creating role:', error)
        showToast('Gagal membuat role', 'error')
        throw error
      }
      finally {
        this.isLoadingSubmit = false
      }
    },

    async updateRole() {
      if (!this.selectedRole)
        return

      this.isLoadingSubmit = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))

        const index = this.roles.findIndex(r => r.id === this.selectedRole?.id)
        if (index !== -1) {
          this.roles[index] = {
            ...this.roles[index],
            name: this.form.name,
            updated_at: new Date().toISOString(),
          }
        }

        showToast('Role berhasil diperbarui', 'success')
        this.dialogVisible = false
        this.resetForm()
        await this.fetchRoles()
      }
      catch (error) {
        console.error('Error updating role:', error)
        showToast('Gagal memperbarui role', 'error')
        throw error
      }
      finally {
        this.isLoadingSubmit = false
      }
    },

    async deleteRole(roleId: string) {
      this.isLoadingDelete = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))

        this.roles = this.roles.filter(r => r.id !== roleId)
        showToast('Role berhasil dihapus', 'success')
        await this.fetchRoles()
      }
      catch (error) {
        console.error('Error deleting role:', error)
        showToast('Gagal menghapus role', 'error')
        throw error
      }
      finally {
        this.isLoadingDelete = false
        this.deleteDialogVisible = false
      }
    },
  },
})
