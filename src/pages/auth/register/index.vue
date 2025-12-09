<!-- eslint-disable import/no-named-default -->
<!-- ❗Errors in the form are set on line 60 -->
<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'

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
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const authStore = useAuthStore()

const isPasswordVisible = ref(false)
const isPasswordConfirmationVisible = ref(false)

const ability = useAbility()

const errors = ref<Record<string, string | undefined>>({
  email: undefined,
  password: undefined,
})

const refVForm = ref<VForm>()

const credentials = ref({
  email: '',
  password: '',
  passwordConfirmation: '',
  name: '',
})

const isLoading = ref(false)

const router = useRouter()

const register = async () => {
  await authStore.register(credentials.value)
  ability.update(authStore.abilities)
  router.push({
    name: 'auth-verify',
    query: {
      email: credentials.value.email,
    },
  }).then(() => {
    showToast('Berhasil mendaftar, silahkan verifikasi email', 'success')
  })
}

const onSubmit = async () => {
  refVForm.value?.validate()
    .then(async ({ valid: isValid }) => {
      if (isValid) {
        isLoading.value = true
        await register()
          .finally(() => {
            isLoading.value = false
          })
      }
    })
}
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
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText>
          <VNodeRenderer
            :nodes="themeConfig.app.logo"
            class="mb-6"
            width="100"
          />
          <h4 class="text-h4 mb-1">
            Daftar Akun
          </h4>
          <p class="mb-0">
            Silahkan daftar akun untuk menggunakan sistem ini
          </p>
        </VCardText>
        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.name"
                  label="Nama"
                  placeholder=""
                  type="text"
                  autofocus
                  :rules="[requiredValidator]"
                  :error-messages="errors.name"
                  validate-on="submit"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="credentials.email"
                  label="Email"
                  placeholder=""
                  type="email"
                  :rules="[requiredValidator, emailValidator]"
                  :error-messages="errors.email"
                  validate-on="submit"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="credentials.password"
                  label="Password"
                  :rules="[requiredValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :error-messages="errors.password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  validate-on="submit"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="credentials.passwordConfirmation"
                  label="Konfirmasi Password"
                  :rules="[requiredValidator]"
                  :type="isPasswordConfirmationVisible ? 'text' : 'password'"
                  :error-messages="errors.passwordConfirmation"
                  :append-inner-icon="isPasswordConfirmationVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  validate-on="submit"
                  @click:append-inner="isPasswordConfirmationVisible = !isPasswordConfirmationVisible"
                />
              </VCol>
              <VCol cols="12">
                <div class="d-flex align-center flex-wrap gap-2 align-center mt-1 mb-4">
                  <span>Sudah punya akun?</span> <RouterLink
                    class="text-primary"
                    :to="{ name: 'login' }"
                  >
                    Masuk
                  </RouterLink>
                </div>

                <VBtn
                  block
                  :loading="isLoading"
                  type="submit"
                >
                  Daftar
                </VBtn>
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
</style>
