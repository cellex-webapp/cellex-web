import axiosInstance from "@/utils/axiosInstance";

export const addressService = {
  getProvinces: async (): Promise<IApiResponse<IAddressDataUnit[]>> => {
    const resp = await axiosInstance.get<IApiResponse<IAddressDataUnit[]>>('/address/provinces');
    return (resp as unknown) as IApiResponse<IAddressDataUnit[]>;
  },

  getCommunesByProvinceCode: async (provinceCode: string): Promise<IApiResponse<IAddressDataUnit[]>> => {
    const resp = await axiosInstance.get<IApiResponse<IAddressDataUnit[]>>(`/address/communes/${provinceCode}`);
    return (resp as unknown) as IApiResponse<IAddressDataUnit[]>;
  },
};