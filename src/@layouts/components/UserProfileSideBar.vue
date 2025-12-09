<script setup lang="ts">
import { avatarText } from '@/@core/utils/formatters'
import { useAbility } from '@/plugins/casl/composables/useAbility'
import { useAuthStore } from '@/stores/authStore'
import { useSidebarDrawerStore } from '@/stores/sidebarDrawer'

const router = useRouter()
const ability = useAbility()

const sidebarDrawer = useSidebarDrawerStore()
const authStore = useAuthStore()
const { userData, roles } = storeToRefs(authStore)
const isLoadingLogout = ref(false)

const resolveUserStatusVariant = (bool: boolean) => {
  if (bool)
    return { color: 'primary', text: 'Active' }

  return { color: 'secondary', text: 'Inactive' }
}

const logout = async () => {
  isLoadingLogout.value = true
  await authStore.logout().then(() => {
    // Reset ability to initial ability
    ability.update([])
    sidebarDrawer.isOpen = false
    router.push('/login')
  }).finally(() => {
    isLoadingLogout.value = false
  })
}
</script>

<template>
  <VNavigationDrawer
    v-if="userData"
    v-model="sidebarDrawer.isOpen"
    temporary
    location="end"
    width="400"
    :scrim="false"
    class="app-customizer"
  >
    <!-- 👉 Header -->
    <div class="customizer-heading d-flex align-center justify-space-between ">
      <VBtn
        icon
        variant="text"
        color="secondary"
        size="x-small"
        @click="sidebarDrawer.reset"
      >
        <VIcon
          icon="tabler-x"
          size="20"
        />
      </VBtn>
    </div>

    <VDivider />

    <VRow>
      <!-- SECTION User Details -->
      <VCol
        cols="12"
        class="px-10 pt-5"
      >
        <div
          v-if="userData.userId"
          class="text-center pt-10"
        >
          <!-- 👉 Avatar -->
          <VAvatar
            rounded
            :size="100"
            color="primary"
            variant="tonal"
          >
            <VImg
              v-if="userData.avatar"
              cover
              :src="userData.avatar"
            />
            <span
              v-else
              class="text-5xl font-weight-semibold"
            >
              {{ avatarText(userData.name || 'P S') }}
            </span>
          </VAvatar>

          <!-- 👉 User name -->
          <h6 class="text-h6 mt-4 mb-0">
            {{ userData.name }}
          </h6>

          <!-- 👉 Role chip -->
          <VChip
            v-for="(role, index) in roles"
            :key="index"
            label
            color="primary"
            size="small"
            class="text-capitalize mt-4"
          >
            {{ role.name }}
          </VChip>
        </div>
        <VDivider class="my-5" />

        <!-- 👉 Details -->
        <div>
          <p class="text-sm text-uppercase text-disabled">
            Biodata
          </p>

          <!-- 👉 User Details list -->
          <VList class="card-list mt-2">
            <VListItem class="marig">
              <VListItemTitle>
                <h6 class="text-base font-weight-semibold">
                  Nama :
                  <span class="text-body-2">
                    {{ userData.name ?? "-" }}
                  </span>
                </h6>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <h6 class="text-base font-weight-semibold">
                  Alamat Email:
                  <span class="text-body-2">{{ userData.email ?? "-" }}</span>
                </h6>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <h6 class="text-base font-weight-semibold">
                  Status:

                  <VChip
                    label
                    size="small"
                    :color="resolveUserStatusVariant(userData.isActive || false).color"
                    class="text-capitalize"
                  >
                    {{ resolveUserStatusVariant(userData.isActive || false).text }}
                  </VChip>
                </h6>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <h6 class="text-base font-weight-semibold">
                  No Telepon:
                  <span class="text-body-2">{{ userData.phone ?? "-" }}</span>
                </h6>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <h6 class="text-base font-weight-semibold">
                  Alamat:
                  <span class="text-body-2">{{
                    userData.employee_profile?.address ?? "-"
                  }}</span>
                </h6>
              </VListItemTitle>
            </VListItem>
          </VList>
        </div>

        <!-- 👉 Logout button -->
        <div class="d-flex justify-center pb-2 mt-5">
          <VBtn
            :loading="isLoadingLogout"
            block
            variant="elevated"
            color="error"
            class="text-white"
            @click="logout"
          >
            <VIcon
              icon="tabler-logout"
              size="20"
              class="me-1"
            />
            Keluar
          </VBtn>
        </div>
      </VCol>
    <!-- !SECTION -->
    </VRow>
  </VNavigationDrawer>
</template>

<style lang="scss">
.app-customizer {
  .customizer-section {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .customizer-heading {
    padding-block: 1rem;
    padding-inline: 1.5rem;
  }

  .custom-input-wrapper {
    .v-col {
      padding-inline: 10px;
    }

    .v-label.custom-input {
      border: none;
      color: rgb(var(--v-theme-on-surface));
      outline: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    }
  }

  .v-navigation-drawer__content {
    display: flex;
    flex-direction: column;
  }

  .v-label.custom-input.active {
    border-color: transparent;
    outline: 2px solid rgb(var(--v-theme-primary));
  }

  .v-label.custom-input:not(.active):hover {
    border-color: rgba(var(--v-border-color), 0.22);
  }

  .customizer-skins {
    .custom-input.active {
      .customizer-skins-icon-wrapper {
        background-color: rgba(var(--v-global-theme-primary), var(--v-selected-opacity));
      }
    }
  }

  .app-customizer-primary-colors {
    .primary-color-wrapper:not(.active) {
      &:hover {
        outline-color: rgba(var(--v-border-color), 0.22) !important;
      }
    }
  }
}

.app-customizer-toggler {
  position: fixed !important;
  inset-block-start: 20%;
  inset-inline-end: 0;
}
</style>
