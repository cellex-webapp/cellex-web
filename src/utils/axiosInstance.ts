import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types/api.type';
import { getItem } from '@/utils/localStorage';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;

axiosInstance.interceptors.request.use((config) => {
    try {
        const url = String(config.url || '');
        const isAuthPublicEndpoint = /(^|\/)auth\/(login|send-signup-code|verify-signup-code)(\/?|$)/.test(url);
        if (!isAuthPublicEndpoint) {
            const token = getItem('access_token');
            if (token) {
                config.headers = {
                    ...(config.headers || {}),
                    Authorization: `Bearer ${token}`,
                } as any;
            }
        }
    } catch {
        // ignore
    }
    return config;
});

export async function apiRequest<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    try {
        const resp: AxiosResponse<ApiResponse<T>> = await axiosInstance.request<ApiResponse<T>>(config);
        const data = resp.data as any;
        if (data && typeof data.code === 'number') {
            if (data.code === 200) return data.result as T;
            const err = new Error(data.message || 'Request failed');
            (err as any).code = data.code;
            throw err;
        }
        return (data as unknown) as T;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const data: any = error.response?.data;
            const err = new Error(data?.message || error.message || 'Request failed');
            (err as any).code = data?.code ?? status ?? 'UNKNOWN_ERROR';
            throw err;
        }
        throw error;
    }
}

// Shorthand helpers
export const api = {
    get: async <T = unknown>(url: string, config?: AxiosRequestConfig) =>
        apiRequest<T>({ ...(config || {}), url, method: 'GET' }),
    post: async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        apiRequest<T>({ ...(config || {}), url, data, method: 'POST' }),
    put: async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        apiRequest<T>({ ...(config || {}), url, data, method: 'PUT' }),
    patch: async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        apiRequest<T>({ ...(config || {}), url, data, method: 'PATCH' }),
    delete: async <T = unknown>(url: string, config?: AxiosRequestConfig) =>
        apiRequest<T>({ ...(config || {}), url, method: 'DELETE' }),
};