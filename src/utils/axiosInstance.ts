import axios, { type InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
    baseURL: baseURL,
    // Do not force 'Content-Type' here so that multipart/form-data requests
    // can let the browser/axios set the correct boundary header automatically.
});

axiosInstance.interceptors.request.use(
    function (config: InternalAxiosRequestConfig) { 
        const token = localStorage.getItem("accessToken");

        if (token && config.url && !config.url.startsWith('/auth')) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    function (response) {
    if (response && response?.data) return response.data; 
        return response;
    },
    function (error) {
        // eslint-disable-next-line no-console
        console.error('[axios] response error:', error?.response?.status, error?.response?.data ?? error.message);
        if (error && error.response && error.response.data) {
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;