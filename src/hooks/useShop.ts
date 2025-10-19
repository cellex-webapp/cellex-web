import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { fetchMyShop, fetchShopById, createShop, updateShop, fetchPendingShops, verifyRegisterShop, clearShopState } from '@/stores/slices/shop.slice';

export const useShop = () => {
  const dispatch = useAppDispatch();

  const shop = useAppSelector((state) => state.shop.shop);
  const pendingShops = useAppSelector((state) => state.shop.pendingShops);
  const isLoading = useAppSelector((state) => state.shop.isLoading);
  const error = useAppSelector((state) => state.shop.error);

  return {
    shop,
    pendingShops,
    isLoading,
    error,
    fetchMyShop: () => dispatch(fetchMyShop()),
    fetchShopById: (id: string) => dispatch(fetchShopById(id)),
    createShop: (payload: ICreateUpdateShopPayload) => dispatch(createShop(payload)),
    updateShop: (id: string, payload: ICreateUpdateShopPayload) => dispatch(updateShop({ id, payload })),
    fetchPendingShops: () => dispatch(fetchPendingShops()),
    verifyRegisterShop: (payload: IVerifyShopPayload) => dispatch(verifyRegisterShop(payload)),
    clearShopState: () => dispatch(clearShopState()),
  };
};

export default useShop;
