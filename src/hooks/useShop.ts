import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { useCallback } from 'react';
import {
  fetchShops,        
  fetchMyShop,
  fetchShopById,
  createShop,
  updateShop,
  updateMyShop,
  verifyRegisterShop,
  clearShopState
} from '@/stores/slices/shop.slice';
import {
  selectCurrentShop,
  selectAllShops,
  selectShopPagination,
  selectShopIsLoading,
  selectShopError,
} from '@/stores/selectors/shop.selector';

export const useShop = () => {
  const dispatch = useAppDispatch();

  const shop = useAppSelector(selectCurrentShop);
  const shops = useAppSelector(selectAllShops); 
  const pagination = useAppSelector(selectShopPagination);
  const isLoading = useAppSelector(selectShopIsLoading);
  const error = useAppSelector(selectShopError);

  const handleFetchShops = useCallback((params?: IPaginationParams) => {
    return dispatch(fetchShops(params));
  }, [dispatch]);

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

  const handleUpdateMyShop = useCallback((payload: IUpdateMyShopPayload) => {
    return dispatch(updateMyShop(payload));
  }, [dispatch]);

  const handleVerifyRegisterShop = useCallback((payload: IVerifyShopPayload) => {
    return dispatch(verifyRegisterShop(payload));
  }, [dispatch]);

  const handleClearShopState = useCallback(() => {
    return dispatch(clearShopState());
  }, [dispatch]);

  return {
    shop,
    shops,            
    pagination,       
    isLoading,
    error,

    fetchShops: handleFetchShops,
    fetchMyShop: handleFetchMyShop,
    fetchShopById: handleFetchShopById,
    createShop: handleCreateShop,
    updateShop: handleUpdateShop,
    updateMyShop: handleUpdateMyShop,
    verifyRegisterShop: handleVerifyRegisterShop,
    clearShopState: handleClearShopState,
  };
};

export default useShop;