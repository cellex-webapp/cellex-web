import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/stores/store';

const selectAuth = (state: RootState) => state.auth;

export const selectIsAuthenticated = createSelector(
  [selectAuth],
  (auth) => auth.isAuthenticated
);

export const selectCurrentUser = createSelector([selectAuth], (auth) => auth.user);

export const selectUserRole = createSelector(
  [selectCurrentUser],
  (user) => user?.role
);

export const selectAuthIsLoading = createSelector(
  [selectAuth],
  (auth) => auth.isLoading
);

export const selectAuthError = createSelector([selectAuth], (auth) => auth.error);