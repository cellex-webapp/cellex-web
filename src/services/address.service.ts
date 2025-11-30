import axiosInstance from "@/utils/axiosInstance";

export const addressService = {
  getProvinces: async (): Promise<IApiResponse<IAddressDataUnit[]>> => {
    const response = await axiosInstance.get<IApiResponse<IAddressDataUnit[]>>('/address/provinces');
    return response.data;
  },

  getCommunesByProvinceCode: async (provinceCode: number): Promise<IApiResponse<IAddressDataUnit[]>> => {
    const response = await axiosInstance.get<IApiResponse<IAddressDataUnit[]>>(`/address/communes/${provinceCode}`);
    return response.data;
  },
};