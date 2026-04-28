import { useCallback, useState } from 'react';
import supplierService from '@/services/supplier.service';

export const useSupplier = () => {
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [pagination, setPagination] = useState<IPaginatedResult<ISupplier> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async (params?: IPaginationParams & { shopId?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await supplierService.getSuppliers(params);
      const result = response.result;
      setSuppliers(result?.content ?? []);
      setPagination(result ?? null);
      return result;
    } catch (err: any) {
      const message = err?.message ?? 'Khong the tai danh sach nha cung cap';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSupplier = useCallback(async (payload: ICreateSupplierPayload) => {
    const response = await supplierService.createSupplier(payload);
    return response.result;
  }, []);

  const updateSupplier = useCallback(async (supplierId: string, payload: IUpdateSupplierPayload) => {
    const response = await supplierService.updateSupplier(supplierId, payload);
    return response.result;
  }, []);

  return {
    suppliers,
    pagination,
    isLoading,
    error,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
  };
};

export default useSupplier;
