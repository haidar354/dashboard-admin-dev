<script lang="ts" setup>
import UserProfileSideBar from '@/@layouts/components/UserProfileSideBar.vue'
import AppLoadingIndicator from '@/components/AppLoadingIndicator.vue'
import Footer from '@/layouts/components/Footer.vue'
import NavBarNotifications from '@/layouts/components/NavBarNotifications.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import adminNavigation from '@/navigation/vertical/admin'
import { useAuthStore } from '@/stores/authStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { useAbility } from '@casl/vue'
import { VerticalNavLayout } from '@layouts'
import ModuleNav from './ModuleNav.vue'

const router = useRouter()
const ability = useAbility()

// SECTION: Loading Indicator
const isFallbackStateActive = ref(false)
const refLoadingIndicator = ref<any>(null)
const breadcrumb = ref<string[]>(['HOME'])
const authStore = useAuthStore()
const { userData } = storeToRefs(authStore)

// watching if the fallback state is active and the refLoadingIndicator component is available
watch([isFallbackStateActive, refLoadingIndicator], () => {
  if (isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.fallbackHandle()

  if (!isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.resolveHandle()
}, { immediate: true })
// !SECTION
onMounted(() => {
  const currentPath = router.currentRoute.value.path.toUpperCase()

  const path = currentPath.split('/')

  path.shift()
  breadcrumb.value = [router.currentRoute.value.meta.name] as string[]
})

// watch change on route change
watch(() => router.currentRoute.value.path, () => {
  const currentPath = router.currentRoute.value.path.toUpperCase()

  const path = currentPath.split('/')

  path.shift()
  breadcrumb.value = [router.currentRoute.value.meta.name] as string[]
})

const navigationStore = useNavigationStore()
const { navigation } = storeToRefs(navigationStore)
const { abilities } = storeToRefs(authStore)

// Initialize admin navigation if user is on admin pages
const initializeAdminNavigation = () => {
  const currentPath = router.currentRoute.value.path
  const isAdminPage = currentPath.startsWith('/admin')

  // Always set admin navigation when on admin pages
  if (isAdminPage)
    navigationStore.setNavigation(adminNavigation)
}

// Watch abilities changes and update CASL
watch(abilities, newAbilities => {
  if (newAbilities && newAbilities.length > 0)
    ability.update(newAbilities)
}, { immediate: true, deep: true })

// Initialize on mount
onMounted(() => {
  // Update abilities to CASL if user is logged in
  if (authStore.isLogin && authStore.abilities.length > 0)
    ability.update(authStore.abilities)

  initializeAdminNavigation()
})

// Watch route changes to update navigation
watch(() => router.currentRoute.value.path, () => {
  initializeAdminNavigation()
})
</script>

<template>
  <VerticalNavLayout :nav-items="navigation">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn
          id="vertical-nav-toggle-btn"
          class="ms-n3 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon
            size="26"
            icon="tabler-menu-2"
          />
        </IconBtn>
        <ModuleNav />

        <VSpacer />
        <span class="me-4 d-none d-md-block">
          {{ userData?.name || "" }}
        </span>
        <UserProfile class="me-2" />
        <NavBarNotifications class="me-2" />
        <NavbarThemeSwitcher />
      </div>
    </template>

    <!--
      <VBreadcrumbs class="mb-3" divider=" / " :items="breadcrumb">
      <template #prepend>
      <VIcon icon="tabler-home" size="small" class="me-2" />
      </template>
      </VBreadcrumbs>
    -->

    <AppLoadingIndicator ref="refLoadingIndicator" />

    <!-- 👉 Pages -->
    <slot name="router-view">
      <RouterView v-slot="{ Component }">
        <Suspense
          :timeout="0"
          @fallback="isFallbackStateActive = true"
          @resolve="isFallbackStateActive = false"
        >
          <Component :is="Component" />
        </Suspense>
      </RouterView>
    </slot>

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <UserProfileSideBar />
  </VerticalNavLayout>
</template>
