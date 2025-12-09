import type { RouteRecordRaw } from 'vue-router/auto'
import { isUserLogin } from '@/composables/auth/authentication'

// 👉 Redirects
export const redirects: RouteRecordRaw[] = [
  // ℹ️ We are redirecting to different pages based on role.
  // NOTE: Role is just for UI purposes. ACL is based on abilities.
  {
    path: '/',
    name: 'index',
    redirect: to => {
      const isLogin = isUserLogin()

      if (isLogin)
        return { name: 'admin-dashboard' }

      return { name: 'login', query: to.query }
    },
  },
]

export const routes: RouteRecordRaw[] = []
