/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

import { setupLayouts } from "virtual:generated-layouts";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
});

router.beforeEach((to, from, next) => {
  const accessToken = localStorage.getItem("access_token");
  const routes = router.getRoutes();
  const protectedRoutes = routes.filter((route) => route.path !== "/login");
  const routePaths = protectedRoutes.map((route) => route.path);

  if (to.path.startsWith("/admin")) {
    to.meta.layout = "admin";
  }

  if (routePaths.includes(to.path) && !accessToken) {
    return next("/login");
  }

  return next();
});

router.onError((err, to) => {
  if (err?.message?.includes?.("Failed to fetch dynamically imported module")) {
    if (localStorage.getItem("vuetify:dynamic-reload")) {
      console.error("Dynamic import error, reloading page did not fix it", err);
    } else {
      localStorage.setItem("vuetify:dynamic-reload", "true");
      location.assign(to.fullPath);
    }
  } else {
    console.error(err);
  }
});

router.isReady().then(() => {
  localStorage.removeItem("vuetify:dynamic-reload");
});

export default router;
