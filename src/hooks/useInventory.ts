import { useCallback, useState } from 'react';
import inventoryService from '@/services/inventory.service';

export const useInventory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchSkus = useCallback(async (keyword: string, params?: { shopId?: string; limit?: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await inventoryService.searchSkus(keyword, params);
      return response.result ?? [];
    } catch (err: any) {
      const message = err?.message ?? 'Khong the tim SKU';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const importInventory = useCallback(async (payload: IInventoryImportPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await inventoryService.importInventory(payload);
      return response.result;
    } catch (err: any) {
      const message = err?.message ?? 'Khong the nhap kho';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const balanceInventory = useCallback(async (payload: IInventoryCheckPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await inventoryService.balanceInventory(payload);
      return response.result;
    } catch (err: any) {
      const message = err?.message ?? 'Khong the can bang kho';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchImportHistory = useCallback(async (params?: { shopId?: string; limit?: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getImportHistory(params);
      return response.result ?? [];
    } catch (err: any) {
      const message = err?.message ?? 'Khong the tai lich su nhap kho';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCheckHistory = useCallback(async (params?: { shopId?: string; limit?: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getCheckHistory(params);
      return response.result ?? [];
    } catch (err: any) {
      const message = err?.message ?? 'Khong the tai lich su kiem ke';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    searchSkus,
    importInventory,
    balanceInventory,
    fetchImportHistory,
    fetchCheckHistory,
  };
};

export default useInventory;
