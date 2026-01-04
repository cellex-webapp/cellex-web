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