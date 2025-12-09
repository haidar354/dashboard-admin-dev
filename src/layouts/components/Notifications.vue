<script lang="ts" setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

import type { Notification } from '@/types/models/notification'

interface Props {
  notifications: Notification[]
  badgeProps?: object
  location?: any
}
interface Emit {
  (e: 'read', value: string[]): void
  (e: 'readAll'): void
  (e: 'remove', value: string): void
  (e: 'click:notification', value: Notification): void
}

const props = withDefaults(defineProps<Props>(), {
  location: 'bottom end',
  badgeProps: undefined,
})

const emit = defineEmits<Emit>()

const isAllMarkRead = computed(() => props.notifications.every(item => item.isRead === true))

const markAllRead = () => {
  if (!isAllMarkRead.value)
    emit('readAll')
}

const totalUnseenNotifications = computed(() => {
  return props.notifications.filter(item => item.isRead === false).length
})
</script>

<template>
  <IconBtn id="notification-btn">
    <VBadge
      v-bind="props.badgeProps"
      :model-value="props.notifications.some(n => !n.isRead)"
      color="error"
      dot
      offset-x="2"
      offset-y="3"
    >
      <VIcon
        size="24"
        icon="tabler-bell"
      />
    </VBadge>

    <VMenu
      activator="parent"
      width="380px"
      :location="props.location"
      offset="12px"
      :close-on-content-click="false"
    >
      <VCard class="d-flex flex-column">
        <!-- 👉 Header -->
        <VCardItem class="notification-section">
          <VCardTitle class="text-h6">
            Notifikasi
          </VCardTitle>

          <template #append>
            <VChip
              v-show="props.notifications.some(n => !n.isRead)"
              size="small"
              color="primary"
              class="me-2"
            >
              {{ totalUnseenNotifications }} New
            </VChip>
            <IconBtn
              v-show="props.notifications.length"
              size="34"
              @click="markAllRead"
            >
              <VIcon
                size="20"
                color="high-emphasis"
                :icon="isAllMarkRead ? 'tabler-mail' : 'tabler-mail-opened'"
              />

              <VTooltip
                activator="parent"
                location="start"
              >
                {{ isAllMarkRead ? 'Semua notifikasi sudah dibaca' : 'Tandai baca semua notifikasi' }}
              </VTooltip>
            </IconBtn>
          </template>
        </VCardItem>

        <VDivider />

        <!-- 👉 Notifications list -->
        <PerfectScrollbar
          :options="{ wheelPropagation: false }"
          style="max-block-size: 23.75rem;"
        >
          <VList class="notification-list rounded-0 py-0">
            <template
              v-for="(notification, index) in props.notifications"
              :key="notification.title"
            >
              <VDivider v-if="index > 0" />
              <VListItem
                link
                lines="one"
                min-height="66px"
                class="list-item-hover-class"
                @click="$emit('click:notification', notification)"
              >
                <!-- Slot: Prepend -->
                <!-- Handles Avatar: Image, Icon, Text -->
                <div class="d-flex align-start gap-3">
                  <VAvatar
                    size="40"
                    :color="notification.color && notification.icon ? notification.color : undefined"
                    :icon="notification.icon || undefined"
                    :variant="notification.icon ? undefined : 'tonal'"
                  >
                    <span v-if="notification.title">{{ avatarText(notification.title) }}</span>
                  </VAvatar>

                  <div>
                    <p class="text-sm font-weight-medium mb-1">
                      {{ notification.title }}
                    </p>
                    <p
                      class="text-body-2 mb-2"
                      style=" letter-spacing: 0.4px !important; line-height: 18px;"
                    >
                      {{ notification.subtitle }}
                    </p>
                    <p
                      class="text-sm text-disabled mb-0"
                      style=" letter-spacing: 0.4px !important; line-height: 18px;"
                    >
                      {{ notification.time }}
                    </p>
                  </div>
                  <VSpacer />

                  <div class="d-flex flex-column align-end">
                    <VIcon
                      size="10"
                      icon="tabler-circle-filled"
                      :color="!notification.isRead ? 'success' : '#a8aaae'"
                      :class="`${notification.isRead ? 'visible-in-hover' : ''}`"
                      class="mb-2"
                    />

                  <!-- <VIcon size="20" icon="tabler-x" class="visible-in-hover" @click="$emit('remove', notification.id)" /> -->
                  </div>
                </div>
              </VListItem>
            </template>

            <VListItem
              v-show="!props.notifications.length"
              class="text-center text-medium-emphasis"
              style="block-size: 56px;"
            >
              <VListItemTitle>Belum ada notifikasi</VListItemTitle>
            </VListItem>
          </VList>
        </PerfectScrollbar>

        <VDivider />

      <!-- 👉 Footer -->
      <!--
        <VCardText v-show="props.notifications.length" class="pa-4">
        <VBtn block size="small">
        View All Notifications
        </VBtn>
        </VCardText>
      -->
      </VCard>
    </VMenu>
  </IconBtn>
</template>

<style lang="scss">
.notification-section {
  padding-block: 0.75rem;
  padding-inline: 1rem;
}

.list-item-hover-class {
  .visible-in-hover {
    display: none;
  }

  &:hover {
    .visible-in-hover {
      display: block;
    }
  }
}

.notification-list.v-list {
  .v-list-item {
    border-radius: 0 !important;
    margin: 0 !important;
    padding-block: 0.75rem !important;
  }
}

// Badge Style Override for Notification Badge
.notification-badge {
  .v-badge__badge {
    /* stylelint-disable-next-line liberty/use-logical-spec */
    min-width: 18px;
    padding: 0;
    block-size: 18px;
  }
}
</style>
