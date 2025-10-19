import axios, { type InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    }
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
        if (error && error.response && error.response.data) {
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;