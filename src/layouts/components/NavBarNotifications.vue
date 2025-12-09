<script lang="ts" setup>
import Notifications from '@/layouts/components/Notifications.vue'

import type { Notification } from '@/types/models/notification'

const dialog = ref(false)

const notificationData = ref<Notification[]>([])

const selectedNotification = ref<Notification | null>(null)

const removeNotification = (notificationId: string) => {
  notificationData.value.forEach((item, index) => {
    if (notificationId === item.id)
      notificationData.value.splice(index, 1)
  })
}

const markRead = (notificationId: string[]) => {
  notificationData.value.forEach(item => {
    notificationId.forEach(id => {
      if (id === item.id)
        item.isRead = true
    })
  })
}

const markReadAll = () => {
  notificationData.value.forEach(item => {
    item.isRead = true
  })
}

const handleNotificationClick = (notification: Notification) => {
  dialog.value = true
  selectedNotification.value = notification
  markRead([notification.id])
}
</script>

<template>
  <div>
    <Notifications
      :notifications="notificationData"
      @remove="removeNotification"
      @read="markRead"
      @read-all="markReadAll"
      @click:notification="handleNotificationClick"
    />

    <VDialog
      v-model="dialog"
      width="500px"
    >
      <VCard :title="selectedNotification?.title">
        <VCardText v-html="selectedNotification?.htmlContent" />

        <VCardActions>
          <VSpacer />

          <VBtn
            text="Tutup"
            @click="dialog = false"
          />
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
