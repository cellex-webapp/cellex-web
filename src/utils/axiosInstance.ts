import axios, { type InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
    baseURL: baseURL,
    // Do not force 'Content-Type' here so that multipart/form-data requests
    // can let the browser/axios set the correct boundary header automatically.
});

// Attach access token for non-auth requests
axiosInstance.interceptors.request.use(
    function (config: InternalAxiosRequestConfig) {
        try {
            const token = localStorage.getItem('accessToken');

            if (token && config.url && !config.url.startsWith('/auth')) {
                // Ensure headers object exists
                if (!config.headers) config.headers = {} as any;
                (config.headers as any).Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            // ignore localStorage errors
        }

        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// Refresh token handling: queue requests while refreshing
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error: any) => void;
    config: InternalAxiosRequestConfig;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            if (token) {
                if (!prom.config.headers) prom.config.headers = {} as any;
                (prom.config.headers as any).Authorization = `Bearer ${token}`;
            }
            prom.resolve(axiosInstance(prom.config));
        }
    });
    failedQueue = [];
};

const logoutAndRedirect = () => {
    try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userInfo');
    } catch (e) {
        // ignore
    }

    if (typeof window !== 'undefined') {
        // Replace history so user cannot go back to protected page
        window.location.replace('/login');
    }
};

axiosInstance.interceptors.response.use(
    function (response) {
        if (response && response?.data) return response.data;
        return response;
    },
    function (error) {
        // eslint-disable-next-line no-console
        console.error('[axios] response error:', error?.response?.status, error?.response?.data ?? error?.message);

        const originalRequest = error?.config as InternalAxiosRequestConfig | undefined;

        // If there's no response or no status, just reject
        if (!error || !error.response) {
            return Promise.reject(error);
        }

        const status = error.response.status;

        // Don't try to refresh when calling auth endpoints
        if (originalRequest && originalRequest.url && originalRequest.url.startsWith('/auth')) {
            return Promise.reject(error.response?.data ?? error);
        }

        if (status === 401 && originalRequest) {
            // avoid infinite loop
            if ((originalRequest as any)._retry) {
                return Promise.reject(error.response?.data ?? error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject, config: originalRequest });
                });
            }

            (originalRequest as any)._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                // No refresh token available
                isRefreshing = false;
                // Clear stored tokens and redirect to login
                logoutAndRedirect();
                return Promise.reject(error.response?.data ?? error);
            }

            return new Promise((resolve, reject) => {
                // Use raw axios (not axiosInstance) to avoid interceptor loops
                axios
                    .post(`${baseURL}/auth/refresh-token`, { refreshToken })
                    .then((resp) => {
                        // resp.data expected to be IApiResponse<ILoginResponse>
                        const data = resp && resp.data ? resp.data : resp;
                        const result = data?.result ?? data;

                        const newAccessToken = result?.accessToken ?? null;
                        const newRefreshToken = result?.refreshToken ?? null;

                        if (newAccessToken) {
                            try {
                                localStorage.setItem('accessToken', newAccessToken);
                                if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
                            } catch (e) {
                                // ignore storage errors
                            }

                            axiosInstance.defaults.headers = axiosInstance.defaults.headers || {} as any;
                            (axiosInstance.defaults.headers as any).Authorization = `Bearer ${newAccessToken}`;

                            processQueue(null, newAccessToken);
                            resolve(axiosInstance(originalRequest));
                        } else {
                            processQueue(data, null);
                            // clear tokens and redirect to login
                            logoutAndRedirect();
                            reject(data);
                        }
                    })
                    .catch((err) => {
                        processQueue(err, null);
                        // clear tokens and redirect to login
                        logoutAndRedirect();
                        reject(err);
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            });
        }

        // For other statuses, prefer to return response.data if available
        if (error && error.response && error.response.data) {
            return Promise.reject(error.response.data);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;