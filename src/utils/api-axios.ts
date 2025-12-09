/* eslint-disable import/no-duplicates */
// utils/api-axios.ts
import { getAccessToken, getRefreshToken, unsetAllCredential } from '@/composables/auth/authentication'
import { useAuthStore } from '@/stores/authStore'
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
} from 'axios'
import axios, {
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosRequestHeaders,
  type InternalAxiosRequestConfig,
} from 'axios'

const logoutAndRedirectToLogin = () => {
  const authStore = useAuthStore()

  authStore.$reset()
  unsetAllCredential()
  window.location.href = '/login'
}

const MAX_RETRY_ATTEMPTS = 3
const DEFAULT_TIMEOUT = 30_000
const BUSINESS_UNIT_ID = getBusinessUnitId() || ''

let isRefreshing = false
let retryAttempts = 0
interface Resolver { resolve: (token: string) => void; reject: (err: any) => void }
const failedQueue: Resolver[] = []

const isFormData = (v: any) => typeof FormData !== 'undefined' && v instanceof FormData

const processQueue = (error: any, token: string | null = null) => {
  while (failedQueue.length) {
    const { resolve, reject } = failedQueue.shift()!

    error ? reject(error) : resolve(token as string)
  }
}

const refreshHttp = axios.create({
  baseURL: import.meta.env.VITE_APPS_API_BASE_URL,
  timeout: 10_000,
  headers: { Accept: 'application/json' },
})

async function doRefreshToken(): Promise<string> {
  const rt = getRefreshToken()
  if (!rt)
    throw new Error('No refresh token available')

  const res = await refreshHttp.post('/auth/refresh-token', { refreshToken: rt })
  const payload = res?.data?.data
  if (!payload?.accessToken)
    throw new Error('Invalid refresh token response')

  const { tokenType, expiresIn, accessToken, refreshToken: newRefreshToken, user, permissions } = payload
  const authStore = useAuthStore()

  await authStore.setCredentials({
    token_type: tokenType,
    expires_in: expiresIn,
    access_token: accessToken,
    refresh_token: newRefreshToken,
  })
  if (user)
    await authStore.setUser(user)
  if (permissions)
    authStore.setAbilities(permissions)

  retryAttempts = 0

  return accessToken
}

export function createAxiosClient(baseURL: string, withAuth = true): AxiosInstance {
  const api = axios.create({
    baseURL,
    timeout: DEFAULT_TIMEOUT,
  })

  // --- REQUEST INTERCEPTOR (perhatikan tipe & headers) ---
  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // pastikan headers bertipe AxiosRequestHeaders
    let headers: AxiosRequestHeaders
    if (!config.headers) {
      // meski secara tipe InternalAxiosRequestConfig.headers tidak nullable,
      // runtime bisa kosong; siapkan default yang kompatibel
      headers = new AxiosHeaders() as AxiosRequestHeaders
    }
    else if (config.headers instanceof AxiosHeaders) {
      headers = config.headers as AxiosRequestHeaders
    }
    else {
      headers = config.headers as AxiosRequestHeaders
    }

    // set header dasar
    if (!headers.get) {
      // Jika bukan instance AxiosHeaders, treat as record
      (headers as any)['Accept'] = (headers as any)['Accept'] ?? 'application/json'
      ;(headers as any)['X-Business-Unit-Id'] = BUSINESS_UNIT_ID
    }
    else {
      if (!headers.has('Accept'))
        headers.set('Accept', 'application/json')
      headers.set('X-Business-Unit-Id', BUSINESS_UNIT_ID)
    }

    // auth
    if (withAuth) {
      const token = getAccessToken()
      if (token) {
        if ((headers as any).set)
          (headers as AxiosHeaders).set('Authorization', `Bearer ${token}`)
        else (headers as any)['Authorization'] = `Bearer ${token}`
      }
    }

    // body: JSON vs FormData
    const body = (config as AxiosRequestConfig).data
    if (body !== undefined && !isFormData(body) && typeof body !== 'string') {
      if ((headers as any).set)
        (headers as AxiosHeaders).set('Content-Type', 'application/json')
      else (headers as any)['Content-Type'] = 'application/json'
    }

    config.headers = headers
    config.timeout ??= DEFAULT_TIMEOUT

    return config
  })

  // --- RESPONSE INTERCEPTOR ---
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean })
      const status = error.response?.status

      if (!(status === 401 && withAuth))
        return Promise.reject(error)

      if (retryAttempts >= MAX_RETRY_ATTEMPTS) {
        unsetAllCredential()

        return Promise.reject(new Error('Authentication failed after multiple attempts'))
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(newToken => {
          originalRequest.headers = originalRequest.headers ?? new AxiosHeaders()
          if ((originalRequest.headers as any).set)
            (originalRequest.headers as AxiosHeaders).set('Authorization', `Bearer ${newToken}`)
          else
            (originalRequest.headers as any)['Authorization'] = `Bearer ${newToken}`

          ;(originalRequest.headers as any)['X-Business-Unit-Id'] = BUSINESS_UNIT_ID

          return api(originalRequest)
        })
      }

      isRefreshing = true
      retryAttempts++

      try {
        const newToken = await doRefreshToken()

        processQueue(null, newToken)

        originalRequest.headers = originalRequest.headers ?? new AxiosHeaders()
        if ((originalRequest.headers as any).set)
          (originalRequest.headers as AxiosHeaders).set('Authorization', `Bearer ${newToken}`)
        else
          (originalRequest.headers as any)['Authorization'] = `Bearer ${newToken}`

        ;(originalRequest.headers as any)['X-Business-Unit-Id'] = BUSINESS_UNIT_ID

        return api(originalRequest)
      }
      catch (refreshErr: any) {
        processQueue(refreshErr, null)

        const rs = refreshErr?.response?.status
        if (rs === 401 || rs === 403 || refreshErr?.message?.includes('No refresh token available'))
          logoutAndRedirectToLogin()

        return Promise.reject(refreshErr)
      }
      finally {
        isRefreshing = false
      }
    },
  )

  return api
}

// Exports instance seperti sebelumnya...
export const $rootAPIx = createAxiosClient(import.meta.env.VITE_APPS_API_BASE_URL)
export const $globalAPIx = createAxiosClient(import.meta.env.VITE_API_GLOBAL_URL)
export const $orgAPIx = createAxiosClient(import.meta.env.VITE_API_ORG_URL)
export const $productAPIx = createAxiosClient(import.meta.env.VITE_API_PRODUCT_URL)
export const $inventoryAPIx = createAxiosClient(import.meta.env.VITE_API_INVENTORY_URL)
export const $hrAPIx = createAxiosClient(import.meta.env.VITE_API_HR_URL)
export const $settingAPIx = createAxiosClient(import.meta.env.VITE_API_SETTING_URL)
export const $salesAPIx = createAxiosClient(import.meta.env.VITE_API_SALES_URL)
export const $purchaseAPIx = createAxiosClient(import.meta.env.VITE_API_PURCHASE_URL)
export const $publicAPIx = createAxiosClient(import.meta.env.VITE_APPS_API_BASE_URL, false)
