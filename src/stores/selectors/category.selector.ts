import { createSelector } from '@reduxjs/toolkit';
import { type RootState } from '@/stores/store';

const selectCategory = (state: RootState) => state.category;

export const selectAllCategories = createSelector(
  [selectCategory],
  (categoryState) => categoryState.categories
);

export const selectCategoryIsLoading = createSelector(
  [selectCategory],
  (categoryState) => categoryState.isLoading
);

export const selectCategoryError = createSelector(
  [selectCategory],
  (categoryState) => categoryState.error
);