import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { LoginRequest, SendSignupCodeRequest, VerifySignupCodeRequest, LoginResult } from '@/types/auth.type';
import { login as apiLogin, logout as apiLogout, sendSignupCode as apiSendSignupCode, verifySignupCode as apiVerifySignupCode } from '@/services/authApi';
import { setItem, removeItem } from '@/utils/localStorage';
import { mapBackendUser } from '@/types/user.type';

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
  loading: boolean;
  error: string | null;
  signupCodeSent: boolean;
  signupVerified: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  signupCodeSent: false,
  signupVerified: false,
};

// Async thunks
export const loginThunk = createAsyncThunk(
  'auth/loginThunk',
  async (payload: LoginRequest, { rejectWithValue }) => {
    try {
  const result = await apiLogin(payload);
  return result;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Login failed');
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logoutThunk', async () => {
  try {
    await apiLogout();
  } finally {
    // ensure local cleanup regardless of server response
    removeItem('access_token');
    removeItem('user');
  }
});

export const sendSignupCodeThunk = createAsyncThunk(
  'auth/sendSignupCode',
  async (payload: SendSignupCodeRequest, { rejectWithValue }) => {
    try {
      await apiSendSignupCode(payload);
      return true as const;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Send code failed');
    }
  }
);

export const verifySignupCodeThunk = createAsyncThunk(
  'auth/verifySignupCode',
  async (payload: VerifySignupCodeRequest, { rejectWithValue }) => {
    try {
      await apiVerifySignupCode(payload);
      return true as const;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Verify code failed');
    }
  }
);

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
      state.loading = false;
      state.error = null;
      removeItem('access_token');
      removeItem('user');
    },
    hydrateFromStorage: (
      state,
      action: PayloadAction<{ token: string | null; user: UserInfo | null }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = Boolean(action.payload.token);
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const payload = action.payload as LoginResult | any;
        const token = (payload?.access_token as string) || (payload?.token as string) || '';
        const backendUser = payload?.user as any;
        const mapped = backendUser ? mapBackendUser(backendUser) : null;
        state.token = token || null;
        state.user = (mapped as any) || null;
        state.isAuthenticated = Boolean(token);
        if (token) setItem('access_token', token);
        if (mapped) setItem('user', JSON.stringify(mapped));
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Login failed';
      })
      // logout
      .addCase(logoutThunk.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      })
      // send signup code
      .addCase(sendSignupCodeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.signupCodeSent = false;
      })
      .addCase(sendSignupCodeThunk.fulfilled, (state) => {
        state.loading = false;
        state.signupCodeSent = true;
      })
      .addCase(sendSignupCodeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Send code failed';
        state.signupCodeSent = false;
      })
      // verify signup code
      .addCase(verifySignupCodeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.signupVerified = false;
      })
      .addCase(verifySignupCodeThunk.fulfilled, (state) => {
        state.loading = false;
        state.signupVerified = true;
      })
      .addCase(verifySignupCodeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Verify code failed';
        state.signupVerified = false;
      });
  },
});

export const { login, logout, hydrateFromStorage } = authSlice.actions;
export default authSlice.reducer;
