// apiClient.ts
import { ofetch } from 'ofetch'
import { Model } from 'vue-api-query'

// bikin client ofetch dengan default baseURL
const $api = ofetch.create({
  baseURL: import.meta.env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// map ke bentuk axios-like supaya vue-api-query bisa terima
const customHttpClient = {
  $get: <T>(url: string, config?: any) => $api<T>(url, { method: 'GET', ...config }),
  $post: <T>(url: string, data?: any, config?: any) => $api<T>(url, { method: 'POST', body: data, ...config }),
  $put: <T>(url: string, data?: any, config?: any) => $api<T>(url, { method: 'PUT', body: data, ...config }),
  $delete: <T>(url: string, config?: any) => $api<T>(url, { method: 'DELETE', ...config }),
  $patch: <T>(url: string, data?: any, config?: any) => $api<T>(url, { method: 'PATCH', body: data, ...config }),
}

// inject ke vue-api-query
Model.$http = customHttpClient
