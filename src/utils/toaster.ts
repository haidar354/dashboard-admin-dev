import { toast } from 'vue3-toastify'

import type { ToastType } from 'vue3-toastify'

export const showToast = (message: string, type: ToastType | undefined = 'default') => {
  toast(message, {
    type,
    theme: 'colored',
    dangerouslyHTMLString: true,
    hideProgressBar: true,
  })
}

export const displayErrorMessages = (errors: { [key: string]: string[] } | undefined) => {
  if (errors) {
    const errorObj = errors

    Object.keys(errorObj).forEach(key => {
      if (Array.isArray(errorObj[key])) {
        errorObj[key].forEach(error => {
          showToast(error, 'error')
        })
      }
      else {
        showToast(errorObj[key].toString(), 'error')
      }
    })
  }
  else {
    showToast('Terjadi Kesalahan', 'error')
    console.error(errors)
  }
}
