import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { getToken, User } from "@/types";
import { AuthService } from "@/services";
import router from "@/router";
import { showMessage } from "@/utils/showmsg";

export const useAuthStore = defineStore(
  "auth",
  () => {
    // State
    const me = ref<User | null>(null);
    const access = ref<string>("");
    const refresh = ref<string>("");
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    // Getters (computed)
    const user = computed(() => me.value);
    const isAuthenticated = computed(() => !!access.value);
    const getAccessToken = computed(() => access.value);
    const getRefreshToken = computed(() => refresh.value);
    const isLoading = computed(() => loading.value);
    const getError = computed(() => error.value);

    // Actions

    async function getToken(credentials: getToken) {
      loading.value = true;
      error.value = null;

      try {
        const response = await AuthService.getToken(credentials);

        access.value = response.access;
        refresh.value = response.refresh;

        showMessage("Logado com sucesso", "success", 1500, "top-right");
        await getMe();
        router.push("/");

        return true;
      } catch (err: any) {
        error.value =
          err?.response?.data?.detail || "Erro ao se logar, verifique suas credenciais!";

        showMessage(error.value, "error", 1500, "top-right");
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
        logout();
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

      return await getToken(credentials);
    }

    function logout() {
      me.value = null;
      access.value = "";
      refresh.value = "";

      router.push("/login");
      showMessage("Deslogado com sucesso", "success", 1500, "top-right");
    }

    async function refreshAccessToken() {
      try {
        const response = await AuthService.refreshToken();
        access.value = response;
        return response;
      } catch (err) {
        logout();
        throw err;
      }
    }

    function clearError() {
      error.value = null;
    }

    return {
      // state
      me,
      access,
      refresh,
      loading,
      error,

      // getters
      user,
      isAuthenticated,
      getAccessToken,
      getRefreshToken,
      isLoading,
      getError,

      // actions
      getToken,
      getMe,
      takeDatas,
      logout,
      refreshAccessToken,
      clearError,
    };
  },
);
