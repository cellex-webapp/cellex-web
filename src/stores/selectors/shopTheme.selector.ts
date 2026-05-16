import { createSelector } from '@reduxjs/toolkit';
import { type RootState } from '@/stores/store';

const selectShopThemeState = (state: RootState) => state.shopTheme;

export const selectTheme = createSelector(
  [selectShopThemeState],
  (state) => state.theme
);

export const selectThemeIsLoading = createSelector(
  [selectShopThemeState],
  (state) => state.isLoading
);

export const selectThemeError = createSelector(
  [selectShopThemeState],
  (state) => state.error
);
