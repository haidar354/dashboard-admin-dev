<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useSidebarDrawerStore } from '@/stores/sidebarDrawer'

const authStore = useAuthStore()
const { userData } = storeToRefs(authStore)
const sidebarDrawer = useSidebarDrawerStore()
</script>

<template>
  <VBadge
    dot
    location="bottom right"
    offset-x="3"
    offset-y="3"
    bordered
    color="success"
  >
    <VAvatar
      class="cursor-pointer"
      color="primary"
      variant="tonal"
      @click="sidebarDrawer.toggle"
    >
      <VImg
        v-if="userData.avatar"
        cover
        :src="userData.avatar"
      />
      <VIcon
        v-else
        icon="tabler-user"
      />
    </VAvatar>
  </VBadge>
</template>
