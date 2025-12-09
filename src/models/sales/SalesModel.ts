import type { HTTPRequestConfig } from 'vue-api-query'
import BaseModel from '../BaseModel'

// Pastikan $salesAPI.axios kompatibel dengan Axios (data, params, headers)
export default class SalesModel<T = any> extends BaseModel {
  declare data: T

  // Di layer ini baseURL dari vue-api-query tidak dipakai (request dioverride)
  baseURL() {
    return ''
  }

  async request(config: HTTPRequestConfig) {
    // ⬇️ gunakan "data" (BUKAN "body") jika klien kamu Axios
    return await $salesAPI.axios(config.url!, {
      method: config.method,
      params: config.params,
      data: config.data,
      headers: config.headers,

      // timeout, withCredentials, dll kalau perlu
    })
  }
}
