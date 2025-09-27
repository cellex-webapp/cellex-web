import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("access_token");
    const auth = token ? `Bearer ${token}` : "";
    config.headers["Authorization"] = auth;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  function (response) {
    if (response.data && typeof response.data === 'object' && 'code' in response.data) {
      if (response.data.code === 200) { 
        return { ...response, data: response.data.result };
      } else {
        throw new Error(response.data.message || 'API Error');
      }
    }
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);
export default instance;