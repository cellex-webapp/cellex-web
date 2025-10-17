import { createSelector } from '@reduxjs/toolkit';
import { type RootState } from '@/stores/store';

const selectUser = (state: RootState) => state.user;

export const selectAllUsers = createSelector(
  [selectUser],
  (userState) => userState.users
);

export const selectSelectedUser = createSelector(
  [selectUser],
  (userState) => userState.selectedUser
);

export const selectUserIsLoading = createSelector(
  [selectUser],
  (userState) => userState.isLoading
);

export const selectUserError = createSelector(
  [selectUser],
  (userState) => userState.error
);