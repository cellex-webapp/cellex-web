import axiosInstance from "@/utils/axiosInstance";

export const analyticsService = {
  getAdminDashboard: async (params?: IAnalyticsParams) => {
    const response = await axiosInstance.get<IApiResponse<IAdminDashboard>>('/analytics/admin/dashboard', { params });
    return response.data;
  },

  getCustomerAnalytics: async (params?: IAnalyticsParams) => {
    const response = await axiosInstance.get<IApiResponse<ICustomerAnalytics>>('/analytics/admin/customers', { params });
    return response.data;
  },

  getShopAnalytics: async (params?: IAnalyticsParams) => {
    const response = await axiosInstance.get<IApiResponse<IShopAnalytics>>('/analytics/admin/shops', { params });
    return response.data;
  },

  getProductAnalytics: async (params?: IAnalyticsParams) => {
    const response = await axiosInstance.get<IApiResponse<IProductAnalytics>>('/analytics/admin/products', { params });
    return response.data;
  },

  getVendorDashboard: async (params: IVendorAnalyticsParams) => {
    const response = await axiosInstance.get<IApiResponse<IVendorDashboard>>('/analytics/vendor/dashboard', { params });
    return response.data;
  }
};