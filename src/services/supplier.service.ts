import axiosInstance from '@/utils/axiosInstance';

export const supplierService = {
  getSuppliers: async (params?: IPaginationParams & { shopId?: string }) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<ISupplier>>>('/suppliers', { params });
    return response.data;
  },

  createSupplier: async (payload: ICreateSupplierPayload) => {
    const response = await axiosInstance.post<IApiResponse<ISupplier>>('/suppliers', payload);
    return response.data;
  },

  updateSupplier: async (supplierId: string, payload: IUpdateSupplierPayload) => {
    const response = await axiosInstance.put<IApiResponse<ISupplier>>(`/suppliers/${supplierId}`, payload);
    return response.data;
  },
};

export default supplierService;
