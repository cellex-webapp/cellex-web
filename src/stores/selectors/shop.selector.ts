import { createSelector } from '@reduxjs/toolkit';
import { type RootState } from '@/stores/store';

const selectShopState = (state: RootState) => state.shop;

export const selectCurrentShop = createSelector(
  [selectShopState],
  (state) => state.shop
);

export const selectAllShops = createSelector(
  [selectShopState],
  (state) => state.shops 
);

export const selectShopPagination = createSelector(
  [selectShopState],
  (state) => state.pagination
);

export const selectShopIsLoading = createSelector(
  [selectShopState],
  (state) => state.isLoading
);

export const selectShopError = createSelector(
  [selectShopState],
  (state) => state.error
);