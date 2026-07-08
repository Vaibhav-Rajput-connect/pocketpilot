import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

apiClient.defaults.withCredentials = true;

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else {
      item.resolve(token!);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't intercept 401s for login/signup/refresh endpoints
      const url = originalRequest.url || "";
      if (url.includes("/auth/login") || url.includes("/auth/signup") || url.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Automatically sends the HttpOnly refresh_token cookie
        await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });

        processQueue(null, "success");
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export interface ApiError {
  detail: any;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.detail) {
      if (typeof data.detail === "string") return data.detail;
      if (Array.isArray(data.detail)) {
        return data.detail.map((e: { msg: string }) => e.msg).join(", ");
      }
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}
