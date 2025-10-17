import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/auth.service';
import { updateUserProfile } from './user.slice';

interface AuthResult {
  user: IUser;
  access_token: string;
  refresh_token: string;
}

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const savedUser = localStorage.getItem('user');
const savedToken = localStorage.getItem('access_token');
const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!savedToken,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload: ILoginPayload, { rejectWithValue }) => {
    try {
  const resp: any = await authService.login(payload);
  return resp.result as AuthResult;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
      return rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    return;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
    return rejectWithValue(message);
  }
});

export const sendSignupCode = createAsyncThunk(
  'auth/sendSignupCode',
  async (payload: ISendSignupCodePayload, { rejectWithValue }) => {
    try {
      await authService.sendSignupCode(payload);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
      return rejectWithValue(message);
    }
  }
);

export const verifySignupCode = createAsyncThunk(
  'auth/verifySignupCode',
  async (payload: IVerifySignupCodePayload, { rejectWithValue }) => {
    try {
  const resp: any = await authService.verifySignupCode(payload);
  return resp.result as AuthResult;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        if (state.user && state.user.id === action.payload.id) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResult>) => {
        const userFromApi = action.payload.user;
        if (!userFromApi.role) {
          userFromApi.role = 'USER'; 
        }
        
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = userFromApi;
        
        localStorage.setItem('access_token', action.payload.access_token);
        localStorage.setItem('refresh_token', action.payload.refresh_token);
        localStorage.setItem('role', userFromApi.role);
        localStorage.setItem('user', JSON.stringify(userFromApi));
      })
      .addCase(verifySignupCode.fulfilled, (state) => {
        state.isLoading = false;
      })
      
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          const a: any = action;
          state.error = a.payload ?? a.error?.message ?? String(a.error) ?? 'Unknown error';
        }
      );
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;