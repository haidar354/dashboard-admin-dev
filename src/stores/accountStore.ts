import { defineStore } from 'pinia'

import type {
  ChangePasswordForm,
  ChangePasswordFormErrors,
  UserAccount,
  UserAccountForm,
  UserAccountFormErrors,
} from '../types/models/account'
import type { ApiResponse } from '@/types/api/response'

export const useAccountStore = defineStore('accountStore', {
  state: () => ({
    userAccount: {} as UserAccount,
    isLoadingFetchData: false as boolean,
    isLoadingSubmit: false as boolean,
    isLoadingUpdatePassword: false as boolean,
    form: {
      name: '',
      email: '',
      phone: '',
      avatar: undefined,
    } as UserAccountForm,
    changePasswordForm: {
      oldPassword: '',
      newPassword: '',
      newPasswordConfirmation: '',
    } as ChangePasswordForm,
    formErrors: {} as UserAccountFormErrors,
    changePasswordFormErrors: {} as ChangePasswordFormErrors,
  }),
  actions: {
    resetForm() {
      this.form = {
        email: '',
        name: '',
        phone: '',
        avatar: undefined,
      } as UserAccountForm
      this.formErrors = {} as UserAccountFormErrors
    },
    resetChangePasswordForm() {
      this.changePasswordForm = {
        oldPassword: '',
        newPassword: '',
        newPasswordConfirmation: '',
      } as ChangePasswordForm
      this.changePasswordFormErrors = {} as ChangePasswordFormErrors
    },
    async fetchUserAccount() {
      this.isLoadingFetchData = true
      await $rootAPI<ApiResponse<UserAccount>>('auth/me')
        .then(response => {
          if (response.data) {
            this.userAccount = response.data
            this.form = Object.keys(this.form).reduce((obj, key) => {
              if (key in response.data) {
                (obj as any)[key]
                  = response.data[key as keyof UserAccountForm]
              }

              return obj
            }, {} as UserAccountForm)
          }
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else showToast(err.data?.message, 'error')

          throw err
        }).finally(() => {
          this.isLoadingFetchData = false
        })
    },
    async fetchDetailAndSetForm() {
      this.resetForm()
      this.fetchUserAccount()
        .then(() => {
          this.form = {
            ...this.form,
            avatar: this.userAccount.avatar
              ? this.userAccount.avatar
              : '',
          }
        })
        .catch(err => {
          throw err
        })
    },
    async updateUserAccount() {
      this.isLoadingSubmit = true

      const { avatar, ...otherData } = this.form
      const formData = convertToFormBody({ ...otherData })
      if (avatar instanceof File)
        formData.append('avatar', avatar)
      await $rootAPI<ApiResponse<UserAccount>>('auth/update-account', {
        method: 'POST',
        body: formData,
      })
        .then(response => {
          if (response.data) {
            this.resetForm()
            this.userAccount = response.data
          }
        })
        .catch(err => {
          if (Object.keys(err.data?.errors || {}).length) {
            this.formErrors = err.data.errors as UserAccountFormErrors
            displayErrorMessages(err.data.errors)
          }
          else {
            showToast(err.data?.message, 'error')
          }
          throw err
        })
        .finally(() => {
          this.isLoadingSubmit = false
        })
    },
    async updateUserPassword() {
      this.isLoadingUpdatePassword = true
      await $rootAPI<ApiResponse<UserAccount>>('auth/update-password', {
        method: 'POST',
        body: this.changePasswordForm,
      })
        .then(response => {
          if (response.data)
            this.resetChangePasswordForm()
        })
        .catch(err => {
          if (Object.keys(err.data?.errors || {}).length) {
            this.changePasswordFormErrors = err.data.errors as ChangePasswordFormErrors
            displayErrorMessages(err.data.errors)
          }
          else {
            showToast(err.data?.message, 'error')
          }
          throw err
        })
        .finally(() => {
          this.isLoadingUpdatePassword = false
        })
    },
  },
})
