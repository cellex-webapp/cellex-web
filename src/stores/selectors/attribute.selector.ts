import { createSelector } from '@reduxjs/toolkit';
import { type RootState } from '@/stores/store';

const selectAttributeState = (state: RootState) => state.attribute;

export const selectAttributes = createSelector(
  [selectAttributeState],
  (state) => {
    return Array.isArray(state.attributes) ? state.attributes : [];
  }
);

export const selectHighlightAttributes = createSelector(
  [selectAttributeState],
  (state) => state.highlightAttributes || []
);

export const selectAttributePagination = createSelector(
  [selectAttributeState],
  (state) => state.pagination
);

export const selectAttributeIsLoading = createSelector(
  [selectAttributeState],
  (state) => state.isLoading
);

export const selectAttributeError = createSelector(
  [selectAttributeState],
  (state) => state.error
);