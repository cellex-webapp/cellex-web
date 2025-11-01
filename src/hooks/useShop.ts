import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { useCallback } from 'react';
import { fetchMyShop, fetchShopById, createShop, updateShop, fetchPendingShops, fetchAllShops, verifyRegisterShop, clearShopState } from '@/stores/slices/shop.slice';

export const useShop = () => {
  const dispatch = useAppDispatch();

  const shop = useAppSelector((state) => state.shop.shop);
  const allShops = useAppSelector((state) => state.shop.allShops);
  const pendingShops = useAppSelector((state) => state.shop.pendingShops);
  const isLoading = useAppSelector((state) => state.shop.isLoading);
  const error = useAppSelector((state) => state.shop.error);

  const handleFetchMyShop = useCallback(() => {
    return dispatch(fetchMyShop());
  }, [dispatch]);

  const handleFetchShopById = useCallback((id: string) => {
    return dispatch(fetchShopById(id));
  }, [dispatch]);

  const handleCreateShop = useCallback((payload: ICreateUpdateShopPayload) => {
    return dispatch(createShop(payload));
  }, [dispatch]);

  const handleUpdateShop = useCallback((id: string, payload: ICreateUpdateShopPayload) => {
    return dispatch(updateShop({ id, payload }));
  }, [dispatch]);

  const handleFetchPendingShops = useCallback(() => {
    return dispatch(fetchPendingShops());
  }, [dispatch]);

  const handleFetchAllShops = useCallback((status?: StatusVerification) => {
    return dispatch(fetchAllShops(status));
  }, [dispatch]);

  const handleVerifyRegisterShop = useCallback((payload: IVerifyShopPayload) => {
    return dispatch(verifyRegisterShop(payload));
  }, [dispatch]);

  const handleClearShopState = useCallback(() => {
    return dispatch(clearShopState());
  }, [dispatch]);

  return {
    shop,
    allShops,
    pendingShops,
    isLoading,
    error,
    fetchMyShop: handleFetchMyShop,
    fetchShopById: handleFetchShopById,
    createShop: handleCreateShop,
    updateShop: handleUpdateShop,
    fetchPendingShops: handleFetchPendingShops,
    fetchAllShops: handleFetchAllShops,
    verifyRegisterShop: handleVerifyRegisterShop,
    clearShopState: handleClearShopState,
  };
};

export default useShop;
