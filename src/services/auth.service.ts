import axiosInstance from "@/utils/axiosInstance";

export const authService = {
  login: async (payload: ILoginPayload) => {
    const response = await axiosInstance.post<IApiResponse<ILoginResponse>>('/auth/login', payload);
    return response.data; 
  },

  logout: async () => {
    const response = await axiosInstance.post<IApiResponse<void>>('/auth/logout');
    return response.data;
  },

  sendSignupCode: async (payload: ISendSignupCodePayload) => {
    const response = await axiosInstance.post<IApiResponse<void>>('/auth/send-signup-code', payload);
    return response.data;
  },

  verifySignupCode: async (payload: IVerifySignupCodePayload) => {
    const response = await axiosInstance.post<IApiResponse<void>>('/auth/verify-signup-code', payload);
    return response.data;
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axiosInstance.post<IApiResponse<ILoginResponse>>('/auth/refresh-token', { refreshToken });
    return response.data;
  },
};