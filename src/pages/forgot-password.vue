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

const email = ref('')
const isLoadingSubmit = ref(false)
const authThemeImg = useGenerateImageVariant(authV2ForgotPasswordIllustrationLight, authV2ForgotPasswordIllustrationDark)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

const authStore = useAuthStore()

const refVForm = ref()
const errors = ref({})
const router = useRouter()

async function requestResetPassword() {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      authStore.resetPasswordData = {
        email: email.value,
        createdAt: undefined,
        countdown: 60,
        canResend: false,
      }
      isLoadingSubmit.value = true
      authStore.requestResetPassword(email.value)
        .then(() => {
          isLoadingSubmit.value = false
          router.push({
            name: 'reset-password',
            query: {
              email: email.value,
            },
          }).then(() => {
            showToast('Silahkan cek email anda untuk mendapatkan kode', 'success')
          })
        }).catch(error => {
          showToast(error.data.message || 'Terjadi Kesalahan', 'error')
          isLoadingSubmit.value = false
        })
    }
  })
}
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
            Lupa Password? 🔒
          </h5>
          <p class="mb-0">
            Masukkan email Anda dan kami akan mengirimkan kode verifikasi ke email Anda
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="requestResetPassword"
          >
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <VTextField
                  v-model="email"
                  label="Email"
                  type="email"
                  :rules="[requiredValidator, emailValidator]"
                  :error-messages="errors.email"
                />
              </VCol>

              <!-- Reset link -->
              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                  :loading="isLoadingSubmit"
                >
                  Kirim Kode
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
