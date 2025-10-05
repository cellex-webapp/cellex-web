import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type Role = 'admin' | 'client' | 'vendor';

export interface UserInfo {
  id: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ token: string; user: UserInfo }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    },
    hydrateFromStorage: (
      state,
      action: PayloadAction<{ token: string | null; user: UserInfo | null }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = Boolean(
        action.payload.token && action.payload.user,
      );
    },
  },
});

export const { login, logout, hydrateFromStorage } = authSlice.actions;
export default authSlice.reducer;
