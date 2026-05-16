import axiosInstance from '@/utils/axiosInstance';

export const shopThemeService = {
  getTheme: async (shopId: string) => {
    const response = await axiosInstance.get<IApiResponse<ITheme>>(`/shops/${shopId}/theme`);
    return response.data;
  },

  createTheme: async (shopId: string, payload: ICreateThemePayload) => {
    const response = await axiosInstance.post<IApiResponse<ITheme>>(`/shops/${shopId}/theme`, payload);
    return response.data;
  },

  updateTheme: async (shopId: string, payload: IUpdateThemePayload) => {
    const response = await axiosInstance.put<IApiResponse<ITheme>>(`/shops/${shopId}/theme`, payload);
    return response.data;
  },

  deleteTheme: async (shopId: string) => {
    const response = await axiosInstance.delete<IApiResponse<string>>(`/shops/${shopId}/theme`);
    return response.data;
  },
};
