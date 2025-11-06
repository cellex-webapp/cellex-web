import { createSelector } from '@reduxjs/toolkit';
import { type RootState } from '@/stores/store';

const selectCouponState = (state: RootState) => state.coupon;

export const selectAllCampaigns = createSelector(
  [selectCouponState],
  (state) => state.campaigns
);

export const selectSelectedCampaign = createSelector(
  [selectCouponState],
  (state) => state.selectedCampaign
);

export const selectCampaignLogs = createSelector(
  [selectCouponState],
  (state) => state.logs
);

export const selectCouponIsLoading = createSelector(
  [selectCouponState],
  (state) => state.isLoading
);

export const selectCouponError = createSelector(
  [selectCouponState],
  (state) => state.error
);