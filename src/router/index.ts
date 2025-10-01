/* eslint-disable import/no-duplicates */
/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

import { setupLayouts } from 'virtual:generated-layouts'
// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { routes } from 'vue-router/auto-routes'
import { includes } from 'vuetify/lib/util/helpers.mjs'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})

// Configurar layouts para rotas administrativas
router.beforeEach((to, from, next) => {
  const accessToken = localStorage.getItem('access_token')
  const routes = router.getRoutes()
  const RemoveLogin = routes.filter(route => route.path !== '/login')
  const mapRoutes = RemoveLogin.map(route => route.path)

  if (to.path.startsWith('/admin')) {
    to.meta.layout = 'admin'
  }
  if (mapRoutes.includes(to.path) && !accessToken) {
    next('/login')
  }
  next()
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
