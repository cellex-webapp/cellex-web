import axiosInstance from '@/utils/axiosInstance';
import toFormData from '@/utils/formData';

export const shopService = {
  //admin
  getShopList: async (status?: StatusVerification): Promise<IApiResponse<IShop[]>> => {
    const resp = await axiosInstance.get<IApiResponse<IShop[]>>('/shops', {
      params: status ? { status } : {},
    });
    return (resp as unknown) as IApiResponse<IShop[]>;
  },
  getShopById: async (id: string): Promise<IApiResponse<IShop>> => {
    const resp = await axiosInstance.get<IApiResponse<IShop>>(`/shops/${id}`);
    return (resp as unknown) as IApiResponse<IShop>;
  },
  verifyRegisterShop: async (payload: IVerifyShopPayload): Promise<IApiResponse<void>> => {
    const resp = await axiosInstance.post<IApiResponse<void>>(`/shops/verify`, payload);
    return (resp as unknown) as IApiResponse<void>;
  },

  //vendor
  createShop: async (payload: ICreateUpdateShopPayload): Promise<IApiResponse<IShop>> => {
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

    const resp = await axiosInstance.post<IApiResponse<IShop>>(`/shops/register-vendor`, fd);
    return (resp as unknown) as IApiResponse<IShop>;
  },
  updateShop: async (id: string, payload: ICreateUpdateShopPayload): Promise<IApiResponse<IShop>> => {
    const fd = toFormData(payload as any);
    const resp = await axiosInstance.put<IApiResponse<IShop>>(`/shops/${id}`, fd);
    return (resp as unknown) as IApiResponse<IShop>;
  },
  getMyShop: async (): Promise<IApiResponse<IShop>> => {
    const resp = await axiosInstance.get<IApiResponse<IShop>>(`/shops/my-shop`);
    return (resp as unknown) as IApiResponse<IShop>;
  },
};