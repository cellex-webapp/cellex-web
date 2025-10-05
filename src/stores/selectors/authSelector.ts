import type { RootState } from '@/stores/RootReducer';

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectRole = (state: RootState) => state.auth.user?.role ?? null;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectSignupCodeSent = (state: RootState) => state.auth.signupCodeSent;
export const selectSignupVerified = (state: RootState) => state.auth.signupVerified;
