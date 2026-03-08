import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { getToken, User } from "@/types";
import { AuthService } from "@/services";
import router from "@/router";
import { showMessage } from "@/utils/showmsg";

export const useAuthStore = defineStore("auth", () => {
  const me = ref<User | null>(null);
  const access = ref<string>(localStorage.getItem("access_token") ?? "");
  const refresh = ref<string>(localStorage.getItem("refresh_token") ?? "");
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const user = computed(() => me.value);
  const isAuthenticated = computed(() => !!access.value);
  const getAccessToken = computed(() => access.value);
  const getRefreshToken = computed(() => refresh.value);
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);

  function persistTokens(tokens: { access: string; refresh: string }) {
    access.value = tokens.access;
    refresh.value = tokens.refresh;
    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
  }

  async function getToken(credentials: getToken) {
    loading.value = true;
    error.value = null;

    try {
      const response = await AuthService.getToken(credentials);

      persistTokens(response);

      await getMe();
      showMessage("Logado com sucesso", "success", 1500, "top-right");
      await router.push("/");

      return true;
    } catch (err: any) {
      error.value = err?.response?.data?.detail || "Erro ao se logar, verifique suas credenciais!";
      showMessage(error.value ?? "Erro desconhecido", "error", 1500, "top-right");
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function getMe() {
    loading.value = true;

    try {
      const response = await AuthService.getMe();
      me.value = response;
    } catch (err) {
      console.error(err);
      logout(false);
    } finally {
      loading.value = false;
    }
  }

  async function takeDatas(user: Array<{ value: string }>) {
    const values = user.map((u) => u.value);

    const credentials: getToken = {
      email: values[0],
      password: values[1],
    };

    return getToken(credentials);
  }

  function logout(showFeedback = true) {
    me.value = null;
    access.value = "";
    refresh.value = "";
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    router.push("/login");

    if (showFeedback) {
      showMessage("Deslogado com sucesso", "success", 1500, "top-right");
    }
  }

  async function refreshAccessToken() {
    try {
      const newAccessToken = await AuthService.refreshToken();
      access.value = newAccessToken;
      localStorage.setItem("access_token", newAccessToken);
      return newAccessToken;
    } catch (err) {
      logout(false);
      throw err;
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    me,
    access,
    refresh,
    loading,
    error,
    user,
    isAuthenticated,
    getAccessToken,
    getRefreshToken,
    isLoading,
    getError,
    getToken,
    getMe,
    takeDatas,
    logout,
    refreshAccessToken,
    clearError,
  };
});
