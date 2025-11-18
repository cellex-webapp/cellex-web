import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface QueueItem {
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

const baseURL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: QueueItem[] = [];


const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const logoutAndRedirect = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('role');
  
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    
    if (token && config.url && !config.url.startsWith('/auth')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error.response?.data || error);
    }

    if (originalRequest.url?.includes('/auth/')) {
      return Promise.reject(error.response?.data || error);
    }

    if (originalRequest._retry) {
      logoutAndRedirect();
      return Promise.reject(error.response?.data || error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          },
          reject: (err) => reject(err),
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const response = await axios.post(`${baseURL}/auth/refresh-token`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data?.result || response.data;
      if (!accessToken) throw new Error('Refresh failed - No access token');

      localStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      processQueue(null, accessToken);
      return axiosInstance(originalRequest);

    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      logoutAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;