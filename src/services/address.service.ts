import axiosInstance from "@/utils/axiosInstance";

export const addressService = {
    getProvinces: () => axiosInstance.get('/address/provinces'),
    getCommunesByProvinceCode: (provinceCode: number) => axiosInstance.get(`/address/communes/${provinceCode}`),
};