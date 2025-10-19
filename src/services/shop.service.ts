import axiosInstance from '@/utils/axiosInstance';

export const shopService = {
  //admin
  getShopById: async (id: string): Promise<IApiResponse<IShop>> => {
    const resp = await axiosInstance.get<IApiResponse<IShop>>(`/shops/${id}`);
    return resp.data;
  },
  verifyRegisterShop: async (payload: IVerifyShopPayload): Promise<IApiResponse<void>> => {
    const resp = await axiosInstance.post<IApiResponse<void>>(`/shops/verify`, payload);
    return resp.data;
  },
  getPendingShops: async (): Promise<IApiResponse<IShop[]>> => {
    const resp = await axiosInstance.get<IApiResponse<IShop[]>>(`/shops/pending`);
    return resp.data;
  },

  //vendor
  createShop: async (payload: ICreateUpdateShopPayload): Promise<IApiResponse<IShop>> => {
    const resp = await axiosInstance.post<IApiResponse<IShop>>(`/shops/register-vendor`, payload);
    return resp.data;
  },
  updateShop: async (id: string, payload: ICreateUpdateShopPayload): Promise<IApiResponse<IShop>> => {
    const resp = await axiosInstance.put<IApiResponse<IShop>>(`/shops/${id}`, payload);
    return resp.data;
  },
  getMyShop: async (): Promise<IApiResponse<IShop>> => {
    const resp = await axiosInstance.get<IApiResponse<IShop>>(`/shops/my-shop`);
    return resp.data;
  },
};