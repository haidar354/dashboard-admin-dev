// composables/uploader/useImageUploader.ts
import type { ItemImage } from '@/types/models/product/item-image'
import { $productAPIx } from '@/utils/api-axios' // <-- axios instance dg interceptor refresh

type Extra = Record<string, any>

export function useImageUploader() {
  function appendExtra(form: FormData, extra: Extra = {}) {
    Object.entries(extra).forEach(([key, val]) => {
      if (val == null)
        return
      if (val instanceof Blob || val instanceof File) {
        form.append(key, val)
      }
      else if (Array.isArray(val)) {
        // kirim array sebagai key[]
        val.forEach(v => form.append(`${key}[]`, typeof v === 'object' ? JSON.stringify(v) : String(v)))
      }
      else if (typeof val === 'object') {
        // object → stringify (atau sesuaikan dgn backend)
        form.append(key, JSON.stringify(val))
      }
      else {
        form.append(key, String(val))
      }
    })
  }

  async function uploadItemImage(
    file: File,
    extra: Extra = {},
    onProgress?: (percent: number) => void,
  ): Promise<ItemImage> {
    const form = new FormData()

    form.append('file', file)
    appendExtra(form, extra)

    const res = await $productAPIx.post('/item-images', form, {
      // jangan set 'Content-Type': multipart → biarkan Axios set boundary-nya
      onUploadProgress: e => {
        if (!onProgress)
          return

        // XHR progress event
        if (typeof e.total === 'number' && e.total > 0) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
        else if ((e as any).progress) {
          // fallback adapter yg isi progress [0..1]
          onProgress(Math.round(((e as any).progress as number) * 100))
        }
      },
    })

    // backend kita mengembalikan { data: {...} }
    return res.data.data as ItemImage
  }

  return { uploadItemImage }
}
