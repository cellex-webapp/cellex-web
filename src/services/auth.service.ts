import axiosInstance from "@/utils/axiosInstance";

export const authService = {
    login: async (payload: ILoginPayload): Promise<IApiResponse<ILoginResponse>> => {
        const resp = await axiosInstance.post<IApiResponse<ILoginResponse>>('/auth/login', payload);
        return (resp as unknown) as IApiResponse<ILoginResponse>;
    },
    logout: async (): Promise<IApiResponse<void>> => {
        const resp = await axiosInstance.post<IApiResponse<void>>('/auth/logout');
        return (resp as unknown) as IApiResponse<void>;
    },
    sendSignupCode: async (payload: ISendSignupCodePayload): Promise<IApiResponse<void>> => {
        const resp = await axiosInstance.post<IApiResponse<void>>('/auth/send-signup-code', payload);
        return (resp as unknown) as IApiResponse<void>;
    },
    verifySignupCode: async (payload: IVerifySignupCodePayload): Promise<IApiResponse<void>> => {
        const resp = await axiosInstance.post<IApiResponse<void>>('/auth/verify-signup-code', payload);
        return (resp as unknown) as IApiResponse<void>;
    },
    refreshToken: async (): Promise<IApiResponse<ILoginResponse>> => {
        const refreshToken = localStorage.getItem('refreshToken');
        const resp = await axiosInstance.post<IApiResponse<ILoginResponse>>('/auth/refresh-token', { refreshToken });
        return (resp as unknown) as IApiResponse<ILoginResponse>;
    },
};