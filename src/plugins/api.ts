import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

interface CreateApiOptions {
  attachAuth?: boolean;
}

export function createApi(basePrefix = "", options: CreateApiOptions = {}): AxiosInstance {
  const { attachAuth = true } = options;

  const api: AxiosInstance = axios.create({
    baseURL: `${apiUrl}${basePrefix}`,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30_000,
  });

  if (attachAuth) {
    api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("access_token");

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        } else if (config.headers) {
          delete config.headers.Authorization;
        }

        if (config.data instanceof FormData && config.headers) {
          delete config.headers["Content-Type"];
        }

        return config;
      },
      (error) => Promise.reject(error),
    );
    let isRefreshing = false;
    let failedQueue: Array<{
      resolve: (token: string) => void;
      reject: (error: unknown) => void;
    }> = [];

    function processQueue(error: unknown, token: string | null = null) {
      failedQueue.forEach((prom) => {
        if (error) {
          prom.reject(error);
        } else {
          prom.resolve(token!);
        }
      });
      failedQueue = [];
    }

    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error);
        }
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const authStore = useAuthStore();

        try {
          const newAccessToken = await authStore.refreshToken();
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          authStore.logout(false);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      },
    );
  }

  return api;
}

export const api = createApi();
export const authApi = createApi("", { attachAuth: false });
export const controlIdApi = createApi("/control_id");
export const controlIdConfigApi = createApi("/control_id_config");
export const controlIdMonitorApi = createApi("/control_id_monitor");
export const usersApi = createApi("/users");
