import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { AppRole, AppRoleLabels, getToken, User } from "@/types";
import { AuthService } from "@/services";
import router from "@/router";
import { showMessage } from "@/utils/showmsg";
import axios from "axios";

interface IToken {
  access: string;
  refresh: string;
}

const DEFAULT_ROLE_LABELS: Record<AppRole, string> = {
  "": "Sem perfil",
  admin: "Administrador",
  guarita: "Guarita",
  sisae: "SISAE",
  aluno: "Aluno",
  servidor: "Servidor",
};

export const useAuthStore = defineStore("auth", () => {
  const me = ref<User | null>(null);
  const token = ref<IToken | null>({
    access: localStorage.getItem("access_token") ?? "",
    refresh: localStorage.getItem("refresh_token") ?? "",
  });
  const isAuthenticated = ref<boolean>(false);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  let meRequest: Promise<void> | null = null;

  const user = computed(() => me.value);
  const role = computed<AppRole>(() => me.value?.effective_app_role || me.value?.app_role || "");
  const roleLabels = computed<AppRoleLabels>(() => ({
    ...DEFAULT_ROLE_LABELS,
    ...(me.value?.role_labels || {}),
  }));
  const isAdmin = computed(() => role.value === "admin");
  const isGuarita = computed(() => role.value === "guarita");
  const isSisae = computed(() => role.value === "sisae");
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);

  const getAccessToken = computed(() => token.value?.access ?? "");
  const getRefreshToken = computed(() => token.value?.refresh ?? "");

  function extractErrorMessage(err: unknown, defaultMessage: string): string {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data;
      if (typeof data === "object" && data !== null) {
        const keys = Object.keys(data);
        if (keys.length > 0) {
          const firstKey = keys[0] as string;
          const detail = (data as Record<string, unknown>)[firstKey];
          return String(Array.isArray(detail) ? detail[0] : detail);
        }
      }
    }
    return defaultMessage;
  }

  function persistTokens(tokens: IToken) {
    token.value = tokens;
    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
  }

  function persistCurrentUser(userData: User | null) {
    if (userData) {
      localStorage.setItem("current_user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("current_user");
    }
  }

  function getDefaultRouteByRole(_currentRole: AppRole) {
    return "/";
  }

  function hasRole(allowedRoles: AppRole[]) {
    if (!allowedRoles.length) return true;
    return allowedRoles.includes(role.value);
  }

  function roleLabel(value?: AppRole | string | null) {
    const normalizedRole = (value || "") as AppRole;
    return roleLabels.value[normalizedRole] || String(value || DEFAULT_ROLE_LABELS[""]);
  }

  async function getMe() {
    if (meRequest) {
      await meRequest;
      return;
    }

    loading.value = true;

    meRequest = (async () => {
      try {
        const response = await AuthService.getMe();
        me.value = response;
        isAuthenticated.value = true;
        persistCurrentUser(response);
      } catch (err) {
        console.error("Erro ao buscar usuário:", err);
        logout(false);
      } finally {
        loading.value = false;
        meRequest = null;
      }
    })();

    await meRequest;
  }

  async function login(credentials: getToken) {
    loading.value = true;
    error.value = null;

    try {
      const response = await AuthService.getToken(credentials);
      persistTokens(response);
      isAuthenticated.value = true;

      await getMe();

      showMessage("Logado com sucesso", "success", 1500, "top-right");
      await router.push(getDefaultRouteByRole(role.value));

      return true;
    } catch (err: unknown) {
      error.value = extractErrorMessage(err, "Erro ao se logar, verifique suas credenciais!");
      showMessage(error.value, "error", 1500, "top-right");
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function takeDatas(user: Array<{ value: string }>) {
    const [email, password] = user.map((u) => u.value);
    return login({ email, password });
  }

async function refreshToken(): Promise<string> {
  const refresh = token.value?.refresh ?? localStorage.getItem("refresh_token");

  if (refresh) {
    const response = await AuthService.refreshToken(refresh);
    token.value = response;
    localStorage.setItem("access_token", response.access);
    localStorage.setItem("refresh_token", response.refresh);
    return response.access;
  } else {
    logout(false);
    throw new Error("Sem refresh token disponível");
  }
}

  function logout(showFeedback = true) {
    me.value = null;
    token.value = null;
    isAuthenticated.value = false;

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    persistCurrentUser(null);

    router.push("/login");

    if (showFeedback) {
      showMessage("Deslogado com sucesso", "success", 1500, "top-right");
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    me,
    token,
    loading,
    error,
    user,
    isAuthenticated,
    role,
    roleLabels,
    roleLabel,
    isAdmin,
    isGuarita,
    isSisae,
    getAccessToken,
    getRefreshToken,
    isLoading,
    getError,
    login,
    getMe,
    takeDatas,
    logout,
    refreshToken,
    clearError,
    hasRole,
    getDefaultRouteByRole,
  };
});
