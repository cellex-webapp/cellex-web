import { createSelector } from '@reduxjs/toolkit';
import { type RootState } from '@/stores/store';

const selectCartState = (state: RootState) => state.cart;

export const selectCart = createSelector(
  [selectCartState],
  (cartState) => cartState.cart
);

export const selectCartIsLoading = createSelector(
  [selectCartState],
  (cartState) => cartState.isLoading
);

export const selectCartError = createSelector(
  [selectCartState],
  (cartState) => cartState.error
);

export const selectCartItems = createSelector(
  [selectCart],
  (cart) => cart?.items || []
);

export const selectTotalCartItemCount = createSelector(
  [selectCart],
  (cart) => cart?.totalQuantity || 0
);

export const selectCartTotalPrice = createSelector(
  [selectCart],
  (cart) => cart?.totalPrice || 0
);