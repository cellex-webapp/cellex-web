import axiosInstance from '@/utils/axiosInstance';

export const inventoryService = {
  searchSkus: async (keyword: string, params?: { shopId?: string; limit?: number }) => {
    const response = await axiosInstance.get<IApiResponse<IInventorySkuSearchItem[]>>('/inventory/skus/search', {
      params: {
        keyword,
        ...params,
      },
    });
    return response.data;
  },

  importInventory: async (payload: IInventoryImportPayload) => {
    const response = await axiosInstance.post<IApiResponse<IInventoryImportResult>>('/inventory/import', payload);
    return response.data;
  },

  balanceInventory: async (payload: IInventoryCheckPayload) => {
    const response = await axiosInstance.post<IApiResponse<IInventoryCheckResult>>('/inventory/check/balance', payload);
    return response.data;
  },

  getImportHistory: async (params?: { shopId?: string; limit?: number }) => {
    const response = await axiosInstance.get<IApiResponse<IInventoryImportHistoryItem[]>>('/inventory/imports', {
      params,
    });
    return response.data;
  },

  getCheckHistory: async (params?: { shopId?: string; limit?: number }) => {
    const response = await axiosInstance.get<IApiResponse<IInventoryCheckHistoryItem[]>>('/inventory/checks', {
      params,
    });
    return response.data;
  },
};

export default inventoryService;
