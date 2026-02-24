import axios, { AxiosError, AxiosRequestConfig, AxiosHeaders } from "axios";
import { getActivePinia } from "pinia";
import { useUserStore } from "~/stores/user";

export interface ApiErrorPayload {
  error?: {
    message?: string;
    code?: string | number;
  };
}

export class HttpError extends Error {
  code?: string | number;
  status?: number;

  constructor(
    message: string,
    options?: { code?: string | number; status?: number },
  ) {
    super(message);
    this.name = "HttpError";
    this.code = options?.code;
    this.status = options?.status;
  }
}

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://127.0.0.1:4000/api";

const TOKEN_KEY = "token";
const USER_KEY = "user";

function getStoreToken(): string | null {
  const pinia = getActivePinia();
  if (!pinia) return null;
  try {
    const store = useUserStore(pinia);
    return store.token ?? null;
  } catch {
    return null;
  }
}

function getAuthToken(): string | null {
  const storeToken = getStoreToken();
  if (storeToken) return storeToken;

  const direct = localStorage.getItem(TOKEN_KEY);
  if (direct) return direct;

  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) return null;

  try {
    const parsed = JSON.parse(rawUser) as { token?: string } | null;
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

http.interceptors.request.use((config) => {
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }

  const token = getAuthToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    const message =
      error.response?.data?.error?.message ?? error.message ?? "Request failed";
    const code = error.response?.data?.error?.code;
    const status = error.response?.status;

    return Promise.reject(new HttpError(message, { code, status }));
  },
);

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await http.request<T>(config);
  return response.data;
}

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, url, method: "GET" }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, url, method: "POST", data }),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, url, method: "PUT", data }),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, url, method: "DELETE" }),
};

export { http };
