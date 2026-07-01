import { reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

// Estado global compartido (singleton reactivo sin Pinia)
const toasts = reactive<Toast[]>([])
let nextId = 0

export function useToast() {
  function show(type: ToastType, message: string, duration = 3500) {
    const id = nextId++
    toasts.push({ id, type, message })
    setTimeout(() => {
      const idx = toasts.findIndex((t) => t.id === id)
      if (idx !== -1) toasts.splice(idx, 1)
    }, duration)
  }

  return {
    toasts,
    success: (msg: string) => show('success', msg),
    error:   (msg: string) => show('error', msg),
    info:    (msg: string) => show('info', msg),
  }
}