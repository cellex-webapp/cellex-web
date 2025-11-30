import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { useCallback } from 'react';
import {
  fetchCampaignsByStatus,
  fetchCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  distributeCampaign,
  fetchCampaignLogs,
  fetchMyCoupons,
  clearSelectedCampaign,
} from '@/stores/slices/coupon.slice';
import {
  selectAllCampaigns,
  selectSelectedCampaign,
  selectCampaignLogs,
  selectMyCoupons,
  selectCouponIsLoading,
  selectCouponError,
} from '@/stores/selectors/coupon.selector';

export const useCoupon = () => {
  const dispatch = useAppDispatch();

  const campaigns = useAppSelector(selectAllCampaigns);
  const selectedCampaign = useAppSelector(selectSelectedCampaign);
  const logs = useAppSelector(selectCampaignLogs);
  const myCoupons = useAppSelector(selectMyCoupons);
  const isLoading = useAppSelector(selectCouponIsLoading);
  const error = useAppSelector(selectCouponError);

  const fetchByStatus = useCallback((status: CampaignStatus) => dispatch(fetchCampaignsByStatus(status)), [dispatch]);
  const fetchById = useCallback((id: string) => dispatch(fetchCampaignById(id)), [dispatch]);
  const create = useCallback((payload: CreateCampaignRequest) => dispatch(createCampaign(payload)), [dispatch]);
  const update = useCallback((id: string, payload: UpdateCampaignRequest) => dispatch(updateCampaign({ id, payload })), [dispatch]);
  const remove = useCallback((id: string) => dispatch(deleteCampaign(id)), [dispatch]);
  const distribute = useCallback((payload: DistributeCampaignRequest) => dispatch(distributeCampaign(payload)), [dispatch]);
  const fetchLogs = useCallback((id: string) => dispatch(fetchCampaignLogs(id)), [dispatch]);
  const fetchMy = useCallback(() => dispatch(fetchMyCoupons()), [dispatch]);
  const clearSelected = useCallback(() => dispatch(clearSelectedCampaign()), [dispatch]);

  return {
    campaigns,
    selectedCampaign,
    logs,
  myCoupons,
    isLoading,
    error,
    fetchCampaignsByStatus: fetchByStatus,
    fetchCampaignById: fetchById,
    createCampaign: create,
    updateCampaign: update,
    deleteCampaign: remove,
    distributeCampaign: distribute,
    fetchCampaignLogs: fetchLogs,
    fetchMyCoupons: fetchMy,
    clearSelectedCampaign: clearSelected,
  };
};