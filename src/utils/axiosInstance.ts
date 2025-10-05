import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types/api.type';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;

// Generic typed request that unwraps ApiResponse<T>
export async function apiRequest<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    const resp: AxiosResponse<ApiResponse<T>> = await axiosInstance.request<ApiResponse<T>>(config);
    const data = resp.data;
    if (data && typeof data.code === 'number') {
        if (data.code === 200) return data.result as T;
        const err = new Error(data.message || 'Request failed');
        (err as any).code = data.code;
        throw err;
    }
    // Fallback when backend doesn't follow the contract strictly
    return (data as unknown) as T;
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