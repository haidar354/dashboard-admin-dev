import type { HTTPRequestConfig } from 'vue-api-query'
import { Model } from 'vue-api-query'

export default class BaseModel extends Model {
  private _$params: Record<string, any> = {}
  baseURL() {
    return import.meta.env.VITE_API_BASE_URL
  }

  resource(): string {
    return ''
  }

  async paginate<T>(page: number, limit: number): Promise<T> {
    return await this.page(page).limit(limit).get<T>()
  }

  async get<T = any>(): Promise<T> {
    const res = await super.get()

    return res as T
  }

  async find<T = any>(id: string | number): Promise<T> {
    const res = await super.find(id)

    return res as T
  }

  async first<T = any>(): Promise<T> {
    const res = await super.first()

    return res as T
  }

  /** Override params() */
  params(payload: Record<string, any>): this {
    // simpan secara local
    console.log('Setting params with payload:', payload)
    this._$params = { ...this._$params, ...payload }

    // tetap panggil original builder
    return super.params(payload)
  }

  /** Getter to read params */
  getParams() {
    return this._$params
  }

  jsonPage(page: number, size = 10) {
    const current = this.getParams() ?? {}

    console.log('Current params before paginate:', current)
    this.params({
      ...current,
      page,
      perPage: size,
    })

    return this
  }

  /** PATCH partial update by id tanpa find() */
  static patchById<T = any>(
    id: string | number,
    data: unknown,
    config: Partial<HTTPRequestConfig> = {},
  ) {
    const m = new this()

    return m.request<T>({
      method: 'patch',

      // gunakan resource() agar relatif ke baseURL client
      url: `${m.resource()}/${id}`,
      data,
      ...config,
    })
  }

  /** PUT full replace by id */
  static putById<T = any>(
    id: string | number,
    data: unknown,
    config: Partial<HTTPRequestConfig> = {},
  ) {
    const m = new this()

    return m.request<T>({
      method: 'put',
      url: `${m.resource()}/${id}`,
      data,
      ...config,
    })
  }

  /** (opsional) DELETE by id */
  static deleteById<T = any>(
    id: string | number,
    config: Partial<HTTPRequestConfig> = {},
  ) {
    const m = new this()

    return m.request<T>({
      method: 'delete',
      url: `${m.resource()}/${id}`,
      ...config,
    })
  }
}
