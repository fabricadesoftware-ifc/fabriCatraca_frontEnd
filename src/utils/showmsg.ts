import { toast, type ToastPosition, type ToastType } from 'vue3-toastify'

export function showMessage (
  message: string,
  type: ToastType,
  duration: number,
  position: ToastPosition,
) {
  toast(message, {
    type,
    autoClose: duration,
    position,
  })
}
