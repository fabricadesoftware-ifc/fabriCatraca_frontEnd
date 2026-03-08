import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
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
  }

  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => Promise.reject(error),
  );

  return api;
}

export const api = createApi();
export const authApi = createApi("", { attachAuth: false });
export const controlIdApi = createApi("/control_id");
export const controlIdConfigApi = createApi("/control_id_config");
export const controlIdMonitorApi = createApi("/control_id_monitor");
export const usersApi = createApi("/users");
