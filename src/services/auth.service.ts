import axiosInstance from "@/utils/axiosInstance";

export const authService = {
    login: (payload: ILoginPayload) => axiosInstance.post('/auth/login', payload),
    logout: () => axiosInstance.post('/auth/logout'),
    sendSignupCode: (payload: ISendSignupCodePayload) => axiosInstance.post('/auth/send-signup-code', payload),
    verifySignupCode: (payload: IVerifySignupCodePayload) => axiosInstance.post('/auth/verify-signup-code', payload),
    refreshToken: () => axiosInstance.post('/auth/refresh-token'),
};