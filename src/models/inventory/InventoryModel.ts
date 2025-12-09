// base/InventoryModel.ts
import type { HTTPRequestConfig } from 'vue-api-query'
import BaseModel from '../BaseModel'
import { $inventoryAPI } from '@/utils/api'

export default class InventoryModel<T = any> extends BaseModel {
  declare data: T

  // Define a base url for a REST API
  baseURL() {
    return ''
  }

  async request(config: HTTPRequestConfig) {
    return await $inventoryAPI.axios<InventoryModel<T>>(config.url!, {
      method: config.method,
      params: config.params,
      body: config.data,
    })
  }
}
