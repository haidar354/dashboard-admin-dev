<script setup>
import { useRouter } from 'vue-router'

import { VNodeRenderer } from '@/@layouts/components/VNodeRenderer'
import { useAuthStore } from '@/stores/authStore'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2ForgotPasswordIllustrationDark from '@images/pages/auth-v2-forgot-password-illustration-dark.png'
import authV2ForgotPasswordIllustrationLight from '@images/pages/auth-v2-forgot-password-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { themeConfig } from '@themeConfig'

const isLoadingSubmit = ref(false)
const isLoadingSend = ref(false)
const authThemeImg = useGenerateImageVariant(authV2ForgotPasswordIllustrationLight, authV2ForgotPasswordIllustrationDark)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

const authStore = useAuthStore()

const refVForm = ref()
const errors = ref({})
const router = useRouter()

const resetPasswordForm = ref({
  email: '',
  token: '',
  password: '',
  passwordConfirmation: '',
})

async function requestNewResetPassword() {
  isLoadingSend.value = true
  authStore.requestResetPassword(authStore.resetPasswordData.email)
    .then(() => {
      showToast('Silahkan cek email anda untuk mendapatkan kode', 'success')
      isLoadingSend.value = false
      authStore.startCountdown()
    }).catch(error => {
      showToast(error.data.message || 'Terjadi Kesalahan', 'error')
      isLoadingSend.value = false
    })
}

async function resetPassword() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      isLoadingSubmit.value = true
      authStore.resetPassword({ ...resetPasswordForm.value, email: authStore.resetPasswordData.email })
        .then(() => {
          router.push('/login').then(() => {
            showToast('Password berhasil diubah', 'success')
          })
          isLoadingSubmit.value = false
        }).catch(error => {
          showToast(error.data.message || 'Terjadi Kesalahan', 'error')
          isLoadingSubmit.value = false
        })
    }
  })
}

onMounted(() => {
  authStore.startCountdown()
  if (!authStore?.resetPasswordData?.email)
    router.push('/login')
})
</script>

<template>
  <VRow
    class="auth-wrapper"
    no-gutters
  >
    <VCol
      lg="8"
      class="d-none d-lg-flex"
    >
      <div class="position-relative auth-bg rounded-lg w-100 ma-8 me-0">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg
            max-width="368"
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <VImg
          class="auth-footer-mask"
          :src="authThemeMask"
        />
      </div>
    </VCol>

    <VCol
      cols="12"
      lg="4"
      class="d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText id="app-logo">
          <VNodeRenderer
            :nodes="themeConfig.app.logo"
            width="100"
            class="mb-6"
          />
          <h5 class="text-h5 font-weight-semibold mb-1">
            Ubah Password 🔒
          </h5>
          <p class="mb-0">
            Masukkan kode verifikasi yang dikirim ke email Anda
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="resetPassword"
          >
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <VTextField
                  v-model="authStore.resetPasswordData.email"
                  label="Email"
                  type="email"
                  :rules="[requiredValidator, emailValidator]"
                  :error-messages="errors.email"
                  :disabled="!authStore.resetPasswordData.canResend"
                />
                <div
                  v-if="authStore.resetPasswordData.countdown"
                  class="v-input__details"
                >
                  <div class="v-messages">
                    <div class="v-messages__message">
                      kirim ulang dalam {{ authStore.resetPasswordData.countdown }}
                    </div>
                  </div><!---->
                </div>
                <div
                  v-else-if="authStore.resetPasswordData.canResend"
                  class="v-input__details"
                  @click="requestNewResetPassword"
                >
                  <div class="v-messages d-flex gap-2">
                    <VProgressCircular
                      v-if="isLoadingSend"
                      color="warning"
                      indeterminate
                      size="20"
                    />
                    <div class="v-messages__message text-primary cursor-pointer my-auto">
                      Kirim ulang
                    </div>
                  </div><!---->
                </div>
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="resetPasswordForm.token"
                  label="Kode Verifikasi"
                  :rules="[requiredValidator]"
                  :error-messages="errors.token"
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="resetPasswordForm.password"
                  label="Password Baru"
                  type="password"
                  :rules="[requiredValidator]"
                  :error-messages="errors.token"
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="resetPasswordForm.passwordConfirmation"
                  label="Ketik Ulang Password Baru"
                  type="password"
                  :rules="[requiredValidator]"
                  :error-messages="errors.token"
                />
              </VCol>

              <!-- Reset link -->
              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                  :loading="isLoadingSubmit"
                >
                  Ubah Password
                </VBtn>
              </VCol>

              <!-- back to login -->
              <VCol cols="12">
                <RouterLink
                  class="d-flex align-center justify-center"
                  :to="{ name: 'login' }"
                >
                  <VIcon
                    icon="tabler-chevron-left"
                    class="flip-in-rtl"
                  />
                  <span>Kembali ke Halaman login</span>
                </RouterLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";

#app-logo svg {
  block-size: 100px;
  inline-size: 100px;
}
</style>

<route lang="yaml">
meta:
  layout: blank
  action: read
  subject: Auth
  redirectIfLoggedIn: true
</route>
