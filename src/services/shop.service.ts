import axiosInstance from '@/utils/axiosInstance';
import toFormData from '@/utils/formData';

export const shopService = {
  getShopList: async (params?: IPaginationParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IShop>>>('/shops', {
      params,
    });
    return response.data;
  },

  getShopById: async (id: string) => {
    const response = await axiosInstance.get<IApiResponse<IShop>>(`/shops/${id}`);
    return response.data;
  },

  verifyRegisterShop: async (payload: IVerifyShopPayload) => {
    const response = await axiosInstance.post<IApiResponse<void>>(`/shops/verify`, payload);
    return response.data;
  },

  createShop: async (payload: ICreateUpdateShopPayload) => {
    const fd = toFormData({
      shopName: payload.shopName,
      description: payload.description,
      provinceCode: payload.provinceCode,
      communeCode: payload.communeCode,
      detailAddress: payload.detailAddress,
      phoneNumber: payload.phoneNumber,
      email: payload.email,
      logo: payload.logo,
    });

    const response = await axiosInstance.post<IApiResponse<IShop>>(`/shops/register-vendor`, fd);
    return response.data;
  },

  updateShop: async (id: string, payload: ICreateUpdateShopPayload) => {
    const fd = toFormData(payload as Record<string, any>);
    const response = await axiosInstance.put<IApiResponse<IShop>>(`/shops/${id}`, fd);
    return response.data;
  },

  getMyShop: async () => {
    const response = await axiosInstance.get<IApiResponse<IShop>>(`/shops/my-shop`);
    return response.data;
  },

  updateMyShop: async (payload: IUpdateMyShopPayload) => {
    const fd = toFormData(payload as Record<string, any>);
    const response = await axiosInstance.put<IApiResponse<IShop>>(`/shops/my-shop`, fd);
    return response.data;
  },
};