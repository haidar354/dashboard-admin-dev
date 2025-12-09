<script lang="ts" setup>
import { layoutConfig } from '@layouts'
import { useLayoutConfigStore } from '@layouts/stores/config'
import { getDynamicI18nProps } from '@layouts/utils'

import { isCanAccessRoute } from '@/plugins/casl/custom'
import type { NavSectionTitle } from '@layouts/types'

interface CustomNavSectionTitle extends NavSectionTitle {
  rules?: Array<{ action: string; subject: string }>
}

defineProps<{
  item: CustomNavSectionTitle
}>()

const configStore = useLayoutConfigStore()
const shallRenderIcon = configStore.isVerticalNavMini()
</script>

<template>
  <li
    v-if="isCanAccessRoute(item.rules || [])"
    class="nav-section-title"
  >
    <div class="title-wrapper">
      <Transition
        name="vertical-nav-section-title"
        mode="out-in"
      >
        <Component
          :is="shallRenderIcon ? layoutConfig.app.iconRenderer : layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'"
          :key="shallRenderIcon"
          :class="shallRenderIcon ? 'placeholder-icon' : 'title-text'"
          v-bind="{ ...layoutConfig.icons.sectionTitlePlaceholder, ...getDynamicI18nProps(item.heading, 'span') }"
        >
          {{ !shallRenderIcon ? item.heading : null }}
        </Component>
      </Transition>
    </div>
  </li>
</template>
