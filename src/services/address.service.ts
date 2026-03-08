import axiosInstance from "@/utils/axiosInstance";

export const addressService = {
  // ==================== Legacy APIs ====================

  getProvinces: async (): Promise<IApiResponse<IAddressDataUnit[]>> => {
    const response = await axiosInstance.get<IApiResponse<IAddressDataUnit[]>>('/address/provinces');
    return response.data;
  },

  getCommunesByProvinceCode: async (provinceCode: string): Promise<IApiResponse<IAddressDataUnit[]>> => {
    const response = await axiosInstance.get<IApiResponse<IAddressDataUnit[]>>(`/address/communes/${provinceCode}`);
    return response.data;
  },

  // ==================== Old Address System APIs (Before 07/2025) ====================

  getOldProvinces: async (): Promise<IApiResponse<IOldProvince[]>> => {
    const response = await axiosInstance.get<IApiResponse<IOldProvince[]>>('/address/old/provinces');
    return response.data;
  },

  getOldDistrictsByProvince: async (provinceId: string): Promise<IApiResponse<IOldDistrict[]>> => {
    const response = await axiosInstance.get<IApiResponse<IOldDistrict[]>>(`/address/old/districts`, {
      params: { provinceId }
    });
    return response.data;
  },

  getOldWardsByDistrict: async (districtId: string): Promise<IApiResponse<IOldWard[]>> => {
    const response = await axiosInstance.get<IApiResponse<IOldWard[]>>(`/address/old/wards`, {
      params: { districtId }
    });
    return response.data;
  },

  // ==================== New Address System APIs (After 07/2025) ====================

  getNewProvinces: async (): Promise<IApiResponse<INewProvince[]>> => {
    const response = await axiosInstance.get<IApiResponse<INewProvince[]>>('/address/new/provinces');
    return response.data;
  },

  getNewWardsByProvince: async (provinceCode: string): Promise<IApiResponse<INewWard[]>> => {
    const response = await axiosInstance.get<IApiResponse<INewWard[]>>(`/address/new/wards`, {
      params: { provinceCode }
    });
    return response.data;
  },

  // ==================== Ward Mapping API ====================

  mapWardCode: async (wardCode: string, codeType?: 'old' | 'new'): Promise<IApiResponse<IWardMappingResponse>> => {
    const response = await axiosInstance.post<IApiResponse<IWardMappingResponse>>('/address/map', {
      ward_code: wardCode,
      code_type: codeType
    });
    return response.data;
  },

  // ==================== Dual Address Display API ====================

  getDualAddress: async (newWardCode: string, detailAddress?: string): Promise<IApiResponse<IDualAddressResponse>> => {
    const response = await axiosInstance.get<IApiResponse<IDualAddressResponse>>('/address/dual', {
      params: {
        newWardCode,
        detailAddress: detailAddress || ''
      }
    });
    return response.data;
  },
};

export const userAddressService = {
  getMyAddresses: async (): Promise<IApiResponse<IUserAddress[]>> => {
    const response = await axiosInstance.get('/users/me/addresses');
    return response.data;
  },

  createAddress: async (data: ICreateUserAddressPayload): Promise<IApiResponse<IUserAddress>> => {
    const response = await axiosInstance.post('/users/me/addresses', data);
    return response.data;
  },

  updateAddress: async (id: string, data: IUpdateUserAddressPayload): Promise<IApiResponse<IUserAddress>> => {
    const response = await axiosInstance.put(`/users/me/addresses/${id}`, data);
    return response.data;
  },

  deleteAddress: async (id: string): Promise<IApiResponse<void>> => {
    const response = await axiosInstance.delete(`/users/me/addresses/${id}`);
    return response.data;
  }
};