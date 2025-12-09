<script lang="ts" setup>
import { useSkins } from '@core/composable/useSkins'
import AppLoadingIndicator from '@/components/AppLoadingIndicator.vue'

const { injectSkinClasses } = useSkins()

// ℹ️ This will inject classes in body tag for accurate styling
injectSkinClasses()

// SECTION: Loading Indicator
const isFallbackStateActive = ref(false)
const refLoadingIndicator = ref<any>(null)

// watching if the fallback state is active and the refLoadingIndicator component is available
watch([isFallbackStateActive, refLoadingIndicator], () => {
  // Pastikan refLoadingIndicator sudah ada dan memiliki method yang dibutuhkan
  if (!refLoadingIndicator.value)
    return

  if (isFallbackStateActive.value && typeof refLoadingIndicator.value.fallbackHandle === 'function')
    refLoadingIndicator.value.fallbackHandle()

  if (!isFallbackStateActive.value && typeof refLoadingIndicator.value.resolveHandle === 'function')
    refLoadingIndicator.value.resolveHandle()
}, { immediate: true })
// !SECTION
</script>

<template>
  <AppLoadingIndicator ref="refLoadingIndicator" />

  <div class="layout-wrapper layout-blank">
    <RouterView #="{ Component }">
      <Suspense
        :timeout="0"
        @fallback="isFallbackStateActive = true"
        @resolve="isFallbackStateActive = false"
      >
        <Component :is="Component" />
      </Suspense>
    </RouterView>
  </div>
</template>

<style>
.layout-wrapper.layout-blank {
  flex-direction: column;
}
</style>
