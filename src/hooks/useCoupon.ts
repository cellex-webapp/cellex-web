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
  clearSelectedCampaign,
} from '@/stores/slices/coupon.slice';
import {
  selectAllCampaigns,
  selectSelectedCampaign,
  selectCampaignLogs,
  selectCouponIsLoading,
  selectCouponError,
} from '@/stores/selectors/coupon.selector';

export const useCoupon = () => {
  const dispatch = useAppDispatch();

  const campaigns = useAppSelector(selectAllCampaigns);
  const selectedCampaign = useAppSelector(selectSelectedCampaign);
  const logs = useAppSelector(selectCampaignLogs);
  const isLoading = useAppSelector(selectCouponIsLoading);
  const error = useAppSelector(selectCouponError);

  const handleFetchByStatus = useCallback((status: CampaignStatus) => dispatch(fetchCampaignsByStatus(status)), [dispatch]);
  const handleFetchById = useCallback((id: string) => dispatch(fetchCampaignById(id)), [dispatch]);
  const handleCreate = useCallback((payload: CreateCampaignRequest) => dispatch(createCampaign(payload)), [dispatch]);
  const handleUpdate = useCallback((id: string, payload: UpdateCampaignRequest) => dispatch(updateCampaign({ id, payload })), [dispatch]);
  const handleDelete = useCallback((id: string) => dispatch(deleteCampaign(id)), [dispatch]);
  const handleDistribute = useCallback((payload: DistributeCampaignRequest) => dispatch(distributeCampaign(payload)), [dispatch]);
  const handleFetchLogs = useCallback((id: string) => dispatch(fetchCampaignLogs(id)), [dispatch]);
  const handleClearSelected = useCallback(() => dispatch(clearSelectedCampaign()), [dispatch]);

  return {
    campaigns,
    selectedCampaign,
    logs,
    isLoading,
    error,
    fetchCampaignsByStatus: handleFetchByStatus,
    fetchCampaignById: handleFetchById,
    createCampaign: handleCreate,
    updateCampaign: handleUpdate,
    deleteCampaign: handleDelete,
    distributeCampaign: handleDistribute,
    fetchCampaignLogs: handleFetchLogs,
    clearSelectedCampaign: handleClearSelected,
  };
};