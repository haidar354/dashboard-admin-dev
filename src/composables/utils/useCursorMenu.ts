// useCursorTargetMenu.ts
import { ref } from 'vue'

export function useCursorTargetMenu() {
  const isOpen = ref(false)

  // ⬅️ target tidak boleh null; gunakan undefined saat reset
  const target = ref<[number, number] | undefined>(undefined)

  function openAt(x: number, y: number) {
    // reset supaya rebind bersih
    isOpen.value = false
    target.value = undefined

    // pastikan urutan: set target → buka
    requestAnimationFrame(() => {
      target.value = [x, y]
      requestAnimationFrame(() => {
        isOpen.value = true
      })
    })
  }

  function openFromEvent(evt: MouseEvent | PointerEvent) {
    evt.preventDefault()
    evt.stopPropagation()
    openAt(evt.clientX, evt.clientY)
  }

  function close() {
    isOpen.value = false
  }
  function onAfterLeave() {
    target.value = undefined
  }

  return { isOpen, target, openAt, openFromEvent, close, onAfterLeave }
}
