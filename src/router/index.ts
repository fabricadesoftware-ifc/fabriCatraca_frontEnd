/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

import { setupLayouts } from "virtual:generated-layouts";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import { useAuthStore } from "@/stores";

const allowedPathsByRole: Record<string, RegExp[]> = {
  admin: [
    /^\/$/,
    /^\/users$/,
    /^\/groups$/,
    /^\/access-rules$/,
    /^\/portal$/,
    /^\/areas$/,
    /^\/devices$/,
    /^\/device-actions$/,
    /^\/easy-setup$/,
    /^\/logs$/,
    /^\/data\/export$/,
    /^\/data\/import$/,
    /^\/guarita$/,
    /^\/visitantes$/,
    /^\/sisae$/,
    /^\/liberar-usuario$/,
    /^\/liberar-turma$/,
  ],
  guarita: [/^\/$/, /^\/guarita$/, /^\/visitantes$/],
  sisae: [/^\/$/, /^\/liberar-usuario$/, /^\/liberar-turma$/, /^\/logs$/],
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const accessToken = localStorage.getItem("access_token");
  const defaultRoute = authStore.getDefaultRouteByRole(authStore.role);
  const routes = router.getRoutes();
  const protectedRoutes = routes.filter((route) => route.path !== "/login");
  const routePaths = protectedRoutes.map((route) => route.path);

  if (to.path.startsWith("/admin")) {
    to.meta.layout = "admin";
  }

  if (to.path === "/login" && accessToken) {
    if (!authStore.me) {
      await authStore.getMe();
    }
    const loginRedirect = authStore.getDefaultRouteByRole(authStore.role);
    if (loginRedirect !== to.path) {
      return next(loginRedirect);
    }
    return next();
  }

  if (routePaths.includes(to.path) && !accessToken) {
    return next("/login");
  }

  if (accessToken && !authStore.me) {
    await authStore.getMe();
  }

  if (accessToken && !authStore.role) {
    authStore.logout(false);
    return next("/login");
  }

  if (accessToken && to.path === "/") {
    const homeRedirect = authStore.getDefaultRouteByRole(authStore.role);
    if (homeRedirect !== to.path) {
      return next(homeRedirect);
    }
    return next();
  }

  if (accessToken) {
    const allowedPatterns = allowedPathsByRole[authStore.role] || [];
    const isAllowed = allowedPatterns.some(pattern => pattern.test(to.path));
    if (!isAllowed) {
      if (defaultRoute !== to.path) {
        return next(defaultRoute);
      }
      return next();
    }
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
