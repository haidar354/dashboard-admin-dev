// utils/api.ts
import { getAccessToken, getRefreshToken, unsetAllCredential } from '@/composables/auth/authentication'
import { useAuthStore } from '@/stores/authStore'
import { getBusinessUnitId } from '@/utils/tenant'
import { type FetchResponse, ofetch } from 'ofetch'
let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = []

const MAX_RETRY_ATTEMPTS = 3
let retryAttempts = 0

const logoutAndRedirectToLogin = () => {
  const authStore = useAuthStore()

  authStore.$reset()
  unsetAllCredential()
  window.location.href = '/login'
}

// ✅ Type di luar function
export interface AxiosLike<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: any
  request: any
}

// 🔧 Utility clone aman (hindari error saat ada FormData)
function safeClone(obj: any) {
  try {
    if (obj?.body instanceof FormData || obj?.body instanceof Blob)
      return obj

    return structuredClone(obj)
  }
  catch {
    return obj
  }
}

// 🔧 Build common fetch options
function toCommonOpts(opts: any, headers: Headers, baseURL: string) {
  const body = opts?.data ?? opts?.body
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  if (!isFormData && body !== undefined && body !== null && typeof body !== 'string')
    headers.set('Content-Type', 'application/json')

  return {
    ...opts,
    baseURL,
    headers,
    body,
    timeout: opts?.timeout || 30000,
  }
}

// 🔁 Process waiting queue during refresh
const processQueue = (error?: any, token?: string) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error)
      reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

// 🔁 Refresh token logic
const refreshToken = async (): Promise<string> => {
  const refreshTokenValue = getRefreshToken()
  if (!refreshTokenValue)
    throw new Error('No refresh token available')

  const res = await ofetch('auth/refresh-token', {
    baseURL: import.meta.env.VITE_APPS_API_BASE_URL,
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: { refreshToken: refreshTokenValue },
    timeout: 10000,
  })

  if (!res?.data)
    throw new Error('Invalid refresh token response')

  const { tokenType, expiresIn, accessToken, refreshToken: newRefreshToken } = res.data
  const authStore = useAuthStore()

  await authStore.setCredentials({
    token_type: tokenType,
    expires_in: expiresIn,
    access_token: accessToken,
    refresh_token: newRefreshToken,
  })

  if (res.data.user)
    await authStore.setUser(res.data.user)
  if (res.data.permissions)
    authStore.setAbilities(res.data.permissions)

  retryAttempts = 0

  return accessToken
}

// 🔧 Helper untuk jalankan request sesuai mode
async function executeFetch<T>(
  url: string,
  common: any,
  mode: 'json' | 'raw' | 'axios',
): Promise<any> {
  if (mode === 'raw' || mode === 'axios') {
    const res = await ofetch.raw<T>(url, common)
    if (mode === 'axios') {
      return {
        data: res._data as T,
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        config: common,
        request: null,
      } as AxiosLike<T>
    }

    return res as FetchResponse<T>
  }

  return await ofetch<T>(url, common)
}

// ---------------------------------------------------------------
// === Main Factory ===
function createAPIClient(baseURL: string, withAuth = true) {
  type Mode = 'json' | 'raw' | 'axios'

  // --- Core function ---
  async function doFetch<T>(url: string, opts: any = {}, mode: Mode = 'json'): Promise<any> {
    const headers = new Headers(opts.headers || {})

    headers.set('Accept', 'application/json')

    // Inject auth headers
    if (withAuth) {
      const token = getAccessToken?.()
      if (token)
        headers.set('Authorization', `Bearer ${token}`)
      const businessUnitId = getBusinessUnitId?.()
      if (businessUnitId)
        headers.set('X-Business-Unit-Id', businessUnitId)
    }

    const common = toCommonOpts(opts, headers, baseURL)
    const makeRun = () => executeFetch<T>(url, common, mode)

    try {
      return await makeRun()
    }
    catch (err: any) {
      // hanya handle 401 dengan auth
      if (!(err?.response?.status === 401 && withAuth))
        throw err

      if (retryAttempts >= MAX_RETRY_ATTEMPTS) {
        unsetAllCredential()
        throw new Error('Authentication failed after multiple attempts')
      }

      // simpan request final lengkap
      const finalRequest = safeClone(
        toCommonOpts({ method: opts.method || 'GET', ...opts }, headers, baseURL),
      )

      // ==== Queue kalau token masih direfresh ====
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then(async newToken => {
            const retryCommon = { ...finalRequest, headers: new Headers(finalRequest.headers) }

            retryCommon.headers.set('Authorization', `Bearer ${newToken}`)

            const businessUnitId = getBusinessUnitId?.()
            if (businessUnitId)
              retryCommon.headers.set('X-Business-Unit-Id', businessUnitId)

            return await executeFetch<T>(url, retryCommon, mode)
          })
      }

      // ==== Jalankan refresh ====
      isRefreshing = true
      retryAttempts++

      try {
        const newToken = await refreshToken()

        processQueue(null, newToken)

        const retryCommon = { ...finalRequest, headers: new Headers(finalRequest.headers) }

        retryCommon.headers.set('Authorization', `Bearer ${newToken}`)

        const businessUnitId = getBusinessUnitId?.()
        if (businessUnitId)
          retryCommon.headers.set('X-Business-Unit-Id', businessUnitId)

        return await executeFetch<T>(url, retryCommon, mode)
      }
      catch (refreshErr: any) {
        processQueue(refreshErr)
        if (
          refreshErr?.response?.status === 401
          || refreshErr?.message?.includes('No refresh token available')
        )
          logoutAndRedirectToLogin()
        throw refreshErr
      }
      finally {
        isRefreshing = false
      }
    }
  }

  // --- Typed wrapper interface ---
  interface APIClient {
    <T = unknown>(url: string, opts?: any): Promise<T>
    raw: <T = unknown>(url: string, opts?: any) => Promise<FetchResponse<T>>
    axios: <T = unknown>(url: string, opts?: any) => Promise<AxiosLike<T>>
  }

  const api = ((url: string, opts?: any) => doFetch(url, opts, 'json')) as APIClient

  api.raw = <T = unknown>(url: string, opts?: any) => doFetch<T>(url, opts, 'raw')
  api.axios = <T = unknown>(url: string, opts?: any) => doFetch<T>(url, opts, 'axios')

  return api
}

// ---------------------------------------------------------------
// === Exports ===
export const $rootAPI = createAPIClient(import.meta.env.VITE_APPS_API_BASE_URL)
export const $globalAPI = createAPIClient(import.meta.env.VITE_API_GLOBAL_URL)
export const $orgAPI = createAPIClient(import.meta.env.VITE_API_ORG_URL)
export const $productAPI = createAPIClient(import.meta.env.VITE_API_PRODUCT_URL)
export const $inventoryAPI = createAPIClient(import.meta.env.VITE_API_INVENTORY_URL)
export const $hrAPI = createAPIClient(import.meta.env.VITE_API_HR_URL)
export const $settingAPI = createAPIClient(import.meta.env.VITE_API_SETTING_URL)
export const $salesAPI = createAPIClient(import.meta.env.VITE_API_SALES_URL)
export const $purchaseAPI = createAPIClient(import.meta.env.VITE_API_PURCHASE_URL)
export const $publicAPI = createAPIClient(import.meta.env.VITE_APPS_API_BASE_URL, false)
