/* eslint-disable indent */
import dayjs from 'dayjs'
import useClipboard from 'vue-clipboard3'

import type { ApiPaginatedResponse, PaginateData } from '@/types/api/response'
import type { FormDataConvertible } from '@/types/utils'

export function customDebounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
) {
  let timerId: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timerId)
    timerId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

function hexToHSL(hex: string) {
  hex = hex.replace('#', '')

  const r = Number.parseInt(hex.substring(0, 2), 16) / 255
  const g = Number.parseInt(hex.substring(2, 4), 16) / 255
  const b = Number.parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h: number = 0
  let s: number
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0
  }
  else {
    const d = max - min

    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToHex(h: number, s: number, l: number) {
  h /= 360
  s /= 100
  l /= 100
  let r: number
  let g: number
  let b: number

  if (s === 0) {
    r = g = b = l
  }
  else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0)
        t += 1
      if (t > 1)
        t -= 1
      if (t < 1 / 6)
        return p + (q - p) * 6 * t
      if (t < 1 / 2)
        return q
      if (t < 2 / 3)
        return p + (q - p) * (2 / 3 - t) * 6

      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function adjustHexColor(hex: string, percent: number) {
  const hsl = hexToHSL(hex)

  hsl.l = Math.max(0, Math.min(100, hsl.l + percent))

  return hslToHex(hsl.h, hsl.s, hsl.l)
}

export const copyToClipboard = async (text: string) => {
  try {
    const { toClipboard } = useClipboard()

    await toClipboard(text)

    showToast('Berhasil disalin', 'success')
  }
  catch (e) {
    console.error(e)
  }
}

export function toRoman(num: number) {
  const romanNumerals = [
    { value: 1000, symbol: 'M' },
    { value: 900, symbol: 'CM' },
    { value: 500, symbol: 'D' },
    { value: 400, symbol: 'CD' },
    { value: 100, symbol: 'C' },
    { value: 90, symbol: 'XC' },
    { value: 50, symbol: 'L' },
    { value: 40, symbol: 'XL' },
    { value: 10, symbol: 'X' },
    { value: 9, symbol: 'IX' },
    { value: 5, symbol: 'V' },
    { value: 4, symbol: 'IV' },
    { value: 1, symbol: 'I' },
  ]

  let result = ''
  for (const numeral of romanNumerals) {
    while (num >= numeral.value) {
      result += numeral.symbol
      num -= numeral.value
    }
  }

  return result
}

export const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0)
    return input.files[0]
}

export function formatRupiah(value: number | string): string {
  if (typeof value === 'string') {
    value = Number.parseFloat(value.replace(/[^,\d]/g, ''))
    if (Number.isNaN(value))
      value = 0
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function filterNumberInput(value: string): string {
  return value.replace(/\D/g, '')
}

export const downloadBlob = (blob: Blob, filename: string): void => {
  // Create a link element
  const link = document.createElement('a')

  // Create a URL for the Blob and set it as the href attribute
  const url = window.URL.createObjectURL(blob)

  link.href = url

  // Set the download attribute to specify the filename
  link.download = filename

  // Append the link to the body
  document.body.appendChild(link)

  // Programmatically click the link to trigger the download
  link.click()

  // Remove the link from the document
  document.body.removeChild(link)

  // Release the object URL
  window.URL.revokeObjectURL(url)
}

export const getYears = (start?: number) => {
  const max = Number.parseInt(dayjs().format('YYYY'))
  const years = []
  for (let index = start || 2010; index <= max; index++) {
    years.push({
      value: index,
      title: index,
    })
  }

  return years
}

export const generatePassword = (length = 12) => {
  const charset
    = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:\',.<>?/'

  let password = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)

    password += charset[randomIndex]
  }

  return password
}

const isEmpty = (value: any): boolean => {
  if (value === undefined || value === null || value === '')
    return true

  if (value instanceof File)
    return value.size === 0 // Check if the file is empty

  if (typeof value === 'object') {
    if (Object.keys(value).length === 0)
      return true

    // Additional checks for objects that might be considered empty
    if (value instanceof FormData)
      return !value.entries().next().done // Check if FormData has entries
  }

  return false
}

export const isFile = (value: any): value is File => {
  return value instanceof File
}

export const convertToFormBody = <T extends FormDataConvertible>(
  sourceData: T,
): FormData => {
  const form = new FormData()
  for (const key in sourceData) {
    if (Object.prototype.hasOwnProperty.call(sourceData, key)) {
      const item = sourceData[key] // No need for type assertion here

      if (isEmpty(item))
        continue // Skip empty items

      if (isFile(item))
        form.append(key, item, item.name)

      // For file blobs
      else if (typeof item === 'boolean')
        form.append(key, item ? '1' : '0')

      // For boolean values
      else if (typeof item === 'object')
        form.append(key, JSON.stringify(item))

      // For other objects
      else form.append(key, String(item)) // For strings, numbers, etc.
    }
  }

  return form
}

export const removeEmptyValue = (
  params: Record<string, any>,
): Record<string, any> => {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  )
}

export const encodeQueryParams = (
  params: Record<string, any>,
): Record<string, any> => {
  const queryParams: Record<string, any> = {}

  Object.keys(params).forEach(key => {
    const value = params[key]

    if (
      value === undefined // Skip undefined values
      || value === null // Skip null values
      || (Array.isArray(value) && value.length === 0) // Skip empty arrays
      || (typeof value === 'string' && value.trim() === '') // Skip empty strings
    )
      return // Skip this parameter

    if (Array.isArray(value)) {
      // For arrays, create entries with `[]` notation
      value.forEach(item => {
        queryParams[`${key}[]`] = queryParams[`${key}[]`] || []
        queryParams[`${key}[]`].push(String(item))
      })
    }
    else {
      // Encode other parameter types
      queryParams[key] = String(value)
    }
  })

  return queryParams
}

export const getExtensionFromUrl = (url: string): string => {
  const parts = url.split('.')
  const extension = parts.length > 1 ? parts.pop() : ''

  return extension ? extension.toLowerCase() : ''
}

export const getTablerIconByExtension = (extension: string): string => {
  const iconMapping: { [key: string]: string } = {
    pdf: 'tabler-file-type-pdf',
    doc: 'tabler-file-type-doc',
    docx: 'tabler-file-type-doc',
    xls: 'tabler-file-type-xls',
    xlsx: 'tabler-file-type-xls',
    png: 'tabler-file-type-png',
    jpg: 'tabler-file-type-jpg',
    jpeg: 'tabler-file-type-jpg',
    mp4: 'tabler-video',
    mp3: 'tabler-music',

    // Add more mappings as needed
  }

  return iconMapping[extension] || 'tabler-file'
}

export const openLink = (link: string) => {
  window.open(link, '_blank')
}

export function changeColor(color: string, amount: number) {
  // #FFF not supportet rather use #FFFFFF
  const clamp = (val: any) => Math.min(Math.max(val, 0), 0xFF)
  const fill = (str: string) => `00${str}`.slice(-2)

  const num = Number.parseInt(color.substr(1), 16)
  const red = clamp((num >> 16) + amount)
  const green = clamp(((num >> 8) & 0x00FF) + amount)
  const blue = clamp((num & 0x0000FF) + amount)

  return `#${fill(red.toString(16))}${fill(green.toString(16))}${fill(
    blue.toString(16),
  )}`
}

export const classroomResolver = (
  grade?: string | null,
  subClass?: string | null,
  majorCode?: string | null,
) => {
  if (grade) {
    let classrooms = `${grade}`

    if (majorCode)
      classrooms += ` ${majorCode}`

    if (subClass)
      classrooms += ` ${subClass}`

    return classrooms
  }
  else {
    return '-'
  }
}

export const getFileNameFromHeader = (contentDisposition: string): string => {
  const filenameMatch = contentDisposition.match(
    /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
  )

  if (filenameMatch && filenameMatch[1])
    return filenameMatch[1].replace(/['"]/g, '') // Remove any surrounding quotes

  return ''
}

export const setPaginateData = <T>(
  paginateData: ApiPaginatedResponse<T>,
): PaginateData<T> => {
  return {
    meta: {
      from: paginateData.meta?.from,
      to: paginateData.meta?.to,
      total: paginateData.meta?.total,
      perPage: paginateData.meta?.perPage,
      currentPage: paginateData.meta?.currentPage,
      lastPage: paginateData.meta?.lastPage,
      hasMore: paginateData.meta?.hasMore,
    },
    data: paginateData.data as T[],
  }
}

export function mapVuetifySortToApi(
  sortArray: { key: string; order: 'asc' | 'desc' }[],
): string[] {
  return sortArray.map(({ key, order }) =>
    order === 'desc' ? `-${key}` : key,
  )
}

export function mapApiSortToVuetify<T>(
  sortArray: string[],
): { key: T; order: 'asc' | 'desc' }[] {
  return sortArray.map(field => {
    if (field.startsWith('-'))
      return { key: field.substring(1) as T, order: 'desc' as const }

    return { key: field as T, order: 'asc' as const }
  })
}

export const generateRandomCodeFor = (object: any, key: string, prefix: string = 'BRG') => {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()

  object[key] = `${prefix}-${random}`
}
