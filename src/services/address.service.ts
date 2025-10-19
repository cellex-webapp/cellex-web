import axiosInstance from "@/utils/axiosInstance";

export const addressService = {
    getProvinces: async (): Promise<IApiResponse<string[]>> => {
        const resp = await axiosInstance.get<IApiResponse<string[]>>('/address/provinces');
        return (resp as unknown) as IApiResponse<string[]>;
    },
    getCommunesByProvinceCode: async (provinceCode: number): Promise<IApiResponse<string[]>> => {
        const resp = await axiosInstance.get<IApiResponse<string[]>>(`/address/communes/${provinceCode}`);
        return (resp as unknown) as IApiResponse<string[]>;
    },
};