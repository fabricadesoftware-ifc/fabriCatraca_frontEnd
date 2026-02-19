import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import router from "@/router";

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

  // Interceptor de request → injeta token automaticamente
  if (attachAuth) {
    api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("access_token");
        if (token && config.headers) {
          config.headers["Authorization"] = `Bearer ${token}`;
        } else if (config.headers) {
          delete config.headers["Authorization"];
        }

        // Se é FormData, remover Content-Type para deixar o navegador definir com boundary
        if (config.data instanceof FormData && config.headers) {
          delete config.headers["Content-Type"];
        }

        return config;
      },
      (error) => Promise.reject(error),
    );
  }

  // Interceptor de response → trata erros globais
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("access_token");
        router.push("/login");
      }
      return Promise.reject(error);
    },
  );

  return api;
}

// Instâncias exportadas
export const api = createApi();
export const controlIdApi = createApi("/control_id");
export const controlIdConfigApi = createApi("/control_id_config");
export const controlIdMonitorApi = createApi("/control_id_monitor");
export const usersApi = createApi("/users");
export const getToken = createApi("/token", { attachAuth: false }); // não envia token
