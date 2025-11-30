import { createSelector } from '@reduxjs/toolkit';
import { type RootState } from '@/stores/store';

const selectCouponState = (state: RootState) => state.coupon;

export const selectAllCampaigns = createSelector(
  [selectCouponState],
  (state) => Array.isArray(state.campaigns) ? state.campaigns : []
);

export const selectSelectedCampaign = createSelector(
  [selectCouponState],
  (state) => state.selectedCampaign
);

export const selectCampaignLogs = createSelector(
  [selectCouponState],
  (state) => Array.isArray(state.logs) ? state.logs : []
);

export const selectCouponIsLoading = createSelector(
  [selectCouponState],
  (state) => state.isLoading
);

export const selectCouponError = createSelector(
  [selectCouponState],
  (state) => state.error
);

export const selectMyCoupons = createSelector(
  [selectCouponState],
  (state) => Array.isArray(state.myCoupons) ? state.myCoupons : []
);