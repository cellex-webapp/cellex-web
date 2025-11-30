import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/stores/store';

const selectProductState = (state: RootState) => state.product; 

export const selectAllProducts = createSelector(
  [selectProductState], 
  (s) => Array.isArray(s.products) ? s.products : []
);

export const selectSelectedProduct = createSelector([selectProductState], (s) => s.selectedProduct);
export const selectProductIsLoading = createSelector([selectProductState], (s) => s.isLoading);
export const selectProductError = createSelector([selectProductState], (s) => s.error);

export const selectProductPagination = createSelector(
  [selectProductState], 
  (s) => s.pagination
);