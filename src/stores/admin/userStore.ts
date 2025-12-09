// Admin User Store (IAM)
import { mockAdminRoles, mockAdminUsers } from '@/plugins/fake-api/handlers/admin/mockIamData'
import type { RequestQueryModel } from '@/types/api/request'
import type { PaginateData } from '@/types/api/response'
import type { AdminRole, AdminUser, AdminUserForm } from '@/types/models/admin'
import { showToast } from '@/utils/toaster'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

export const useAdminUserStore = defineStore('adminUserStore', {
  state: () => ({
    paginateData: { data: [], meta: { from: 0, to: 0, total: 0, perPage: 10, currentPage: 1, lastPage: 1 } } as PaginateData<AdminUser>,
    users: [] as AdminUser[],
    roles: [] as AdminRole[],
    selectedUser: null as AdminUser | null,
    isLoading: false,
    isLoadingSubmit: false,
    isLoadingDelete: false,
    requestQuery: {
      page: 1,
      perPage: 10,
      search: '',
    } as RequestQueryModel,
    form: {
      email: '',
      name: '',
      phone: '',
      roleId: '',
      password: '',
      status: 'active',
    } as AdminUserForm,
    formErrors: {} as Partial<Record<keyof AdminUserForm, string>>,
    dialogVisible: false,
    dialogMode: 'create' as 'create' | 'edit' | 'view',
  }),

  actions: {
    async fetchUsers() {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))

        let filteredData = [...mockAdminUsers]

        // Ensure all users have role
        filteredData = filteredData.map(user => {
          if (!user.role) {
            // Find role by matching with existing roles or use first role as fallback
            const role = this.roles.find(r => r.id === user.role?.id) || this.roles[0] || mockAdminRoles[0]

            return { ...user, role }
          }

          return user
        })

        // Apply search filter
        if (this.requestQuery.search) {
          const search = this.requestQuery.search.toLowerCase()

          filteredData = filteredData.filter(u =>
            u.name?.toLowerCase().includes(search)
            || u.email?.toLowerCase().includes(search),
          )
        }

        // Pagination
        const total = filteredData.length
        const perPage = this.requestQuery.perPage || 10
        const page = this.requestQuery.page || 1
        const start = (page - 1) * perPage
        const end = start + perPage

        this.paginateData = {
          data: filteredData.slice(start, end),
          meta: {
            from: start + 1,
            to: Math.min(end, total),
            total,
            perPage,
            currentPage: page,
            lastPage: Math.ceil(total / perPage),
          },
        }
        this.users = filteredData
      }
      catch (error) {
        console.error('Error fetching users:', error)
        showToast('Gagal memuat data users', 'error')
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchRoles() {
      try {
        await new Promise(resolve => setTimeout(resolve, 200))
        this.roles = mockAdminRoles
      }
      catch (error) {
        console.error('Error fetching roles:', error)
        showToast('Gagal memuat data roles', 'error')
        this.roles = mockAdminRoles // Fallback to mock data
      }
    },

    async createUser() {
      this.isLoadingSubmit = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))

        const role = this.roles.find(r => r.id === this.form.roleId)
        if (!role) {
          showToast('Role tidak ditemukan', 'error')

          return
        }

        const newUser: AdminUser = {
          id: uuidv4(),
          email: this.form.email,
          name: this.form.name,
          phone: this.form.phone,
          role,
          status: this.form.status as 'active' | 'inactive',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        mockAdminUsers.unshift(newUser)
        showToast('User berhasil ditambahkan', 'success')
        this.resetForm()
        this.dialogVisible = false
        await this.fetchUsers()
      }
      catch (error) {
        showToast('Gagal menambahkan user', 'error')
        throw error
      }
      finally {
        this.isLoadingSubmit = false
      }
    },

    async updateUser() {
      if (!this.selectedUser)
        return

      this.isLoadingSubmit = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))

        const role = this.roles.find(r => r.id === this.form.roleId)
        if (!role) {
          showToast('Role tidak ditemukan', 'error')

          return
        }

        const index = mockAdminUsers.findIndex(u => u.id === this.selectedUser!.id)
        if (index !== -1) {
          mockAdminUsers[index] = {
            ...mockAdminUsers[index],
            email: this.form.email,
            name: this.form.name,
            phone: this.form.phone,
            role,
            status: this.form.status as 'active' | 'inactive',
            updatedAt: new Date().toISOString(),
          }
        }

        showToast('User berhasil diperbarui', 'success')
        this.resetForm()
        this.dialogVisible = false
        await this.fetchUsers()
      }
      catch (error) {
        showToast('Gagal memperbarui user', 'error')
        throw error
      }
      finally {
        this.isLoadingSubmit = false
      }
    },

    async deleteUser(userId: string) {
      this.isLoadingDelete = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))

        const index = mockAdminUsers.findIndex(u => u.id === userId)
        if (index !== -1)
          mockAdminUsers.splice(index, 1)

        showToast('User berhasil dihapus', 'success')
        await this.fetchUsers()
      }
      catch (error) {
        showToast('Gagal menghapus user', 'error')
        throw error
      }
      finally {
        this.isLoadingDelete = false
      }
    },

    setFormFromUser(user: AdminUser) {
      this.selectedUser = user
      this.form = {
        email: user.email,
        name: user.name,
        phone: user.phone || '',
        roleId: user.role?.id || '',
        status: user.status === 'suspended' ? 'inactive' : user.status,
      }
    },

    resetForm() {
      this.form = {
        email: '',
        name: '',
        phone: '',
        roleId: '',
        password: '',
        status: 'active',
      }
      this.formErrors = {}
      this.selectedUser = null
    },

    openDialog(mode: 'create' | 'edit' | 'view', user?: AdminUser) {
      this.dialogMode = mode
      if (user)
        this.setFormFromUser(user)
      else
        this.resetForm()

      this.dialogVisible = true
    },

    closeDialog() {
      this.dialogVisible = false
      this.resetForm()
    },
  },
})
