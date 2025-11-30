import { createSelector } from '@reduxjs/toolkit';
import { type RootState } from '@/stores/store';

const selectCustomerSegmentState = (state: RootState) => state.segment;

export const selectAllSegments = createSelector(
  [selectCustomerSegmentState],
  (state) => Array.isArray(state.segments) ? state.segments : []
);

export const selectSelectedSegment = createSelector(
  [selectCustomerSegmentState],
  (state) => state.selectedSegment
);

export const selectCustomerSegmentIsLoading = createSelector(
  [selectCustomerSegmentState],
  (state) => state.isLoading
);

export const selectCustomerSegmentError = createSelector(
  [selectCustomerSegmentState],
  (state) => state.error
);