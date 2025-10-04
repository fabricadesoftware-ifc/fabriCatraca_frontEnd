/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Types
import type { App } from 'vue'

// Plugins
import Vue3Toasity, { type ToastContainerOptions } from 'vue3-toastify'
import router from '../router'
import pinia from '../stores'
import vuetify from './vuetify'

export function registerPlugins (app: App) {
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
    .use(Vue3Toasity, { useHandlers: true } as ToastContainerOptions)
}
