<!-- eslint-disable import/no-named-default -->
<!-- ❗Errors in the form are set on line 60 -->
<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import {
  default as authV2LoginIllustrationBorderedDark,
  default as authV2LoginIllustrationBorderedLight,
  default as authV2LoginIllustrationDark,
  default as authV2LoginIllustrationLight,
} from '@images/illustrations/outlet.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'

const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

const router = useRouter()

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const authStore = useAuthStore()

const credentials = ref({
  email: '',
  code: '',
})

const isLoading = ref(false)
const isResendLoading = ref(false)

const route = useRoute()

const verifyEmail = async () => {
  isLoading.value = true
  await authStore.verifyEmail(credentials.value.email, credentials.value.code)
    .then(() => {
      router.push({ name: 'login' }).then(() => {
        showToast('Email berhasil diverifikasi, silahkan login', 'success')
      })
    })
    .finally(() => {
      isLoading.value = false
    })
}

const resendCode = async () => {
  isResendLoading.value = true
  await authStore.resendCode(credentials.value.email)
    .finally(() => {
      isResendLoading.value = false
    })
}

onMounted(async () => {
  credentials.value.email = route.query.email as string
  credentials.value.code = route.query.code as string

  if (!credentials.value.email)
    router.push({ name: 'login' })

  if (credentials.value.code)
    await verifyEmail()
  console.log(credentials.value)
})
</script>

<template>
  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <VCol
      lg="8"
      class="d-none d-lg-flex"
    >
      <div class="position-relative bg-background rounded-lg w-100 ma-8 me-0">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg
            max-width="900"
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <VImg
          :src="authThemeMask"
          class="auth-footer-mask"
        />
      </div>
    </VCol>

    <VCol
      cols="12"
      lg="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText class="text-center">
          <h4 class="text-h4 mb-1">
            Verifikasi Email
          </h4>
          <div class="mb-0">
            Silakan verifikasi email dengan klik tautan yang telah dikirimkan ke email {{ credentials.email }}
          </div>
          <div class="text-error">
            (Cek folder Spam Jika Tidak Ditemukan)
          </div>
          <div>
            Belum menerima email?
            <VBtn
              color="success"
              variant="text"
              :loading="isResendLoading"
              @click="resendCode"
            >
              Kirim Ulang
            </VBtn>
          </div>
          <VDivider class="my-4" />
          <div>Sudah punya akun?</div>
          <div>Kembali ke halaman awal untuk login</div>
          <VBtn
            color="primary"
            variant="outlined"
            :to="{ name: 'login' }"
            class="mt-4"
          >
            Kembali
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
