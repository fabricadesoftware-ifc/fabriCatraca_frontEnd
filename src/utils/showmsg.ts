import { toast } from "vue3-toastify";

export function showMessage(
  message: string,
  type: string,
  duration: number,
  position: string,
) {
  toast(message, {
    type,
    autoClose: duration,
    position: position,
  });
}
