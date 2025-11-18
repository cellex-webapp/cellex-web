import { createSlice, createAsyncThunk, type PayloadAction, isPending, isRejectedWithValue } from '@reduxjs/toolkit';
import { authService } from '@/services/auth.service';
import { updateUserProfile } from './user.slice';
import { getErrorMessage } from '@/helpers/errorHandler';

type ThunkConfig = { rejectValue: string };

interface AuthResult {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const savedUser = localStorage.getItem('user');
const savedToken = localStorage.getItem('accessToken');
const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!savedToken,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk<AuthResult, ILoginPayload, ThunkConfig>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const resp = await authService.login(payload);
      return resp.result
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const logout = createAsyncThunk<void, void, ThunkConfig>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  });

export const sendSignupCode = createAsyncThunk<void, ISendSignupCodePayload, ThunkConfig>(
  'auth/sendSignupCode',
  async (payload, { rejectWithValue }) => {
    try {
      await authService.sendSignupCode(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const verifySignupCode = createAsyncThunk<void, IVerifySignupCodePayload, ThunkConfig>(
  'auth/verifySignupCode',
  async (payload, { rejectWithValue }) => {
    try {
      await authService.verifySignupCode(payload);
      return;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
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
        state.isAuthenticated = false;
        state.user = null;
        state.isLoading = false;
        ['accessToken', 'refreshToken', 'user', 'role'].forEach(k => localStorage.removeItem(k));
      })

      .addCase(updateUserProfile.fulfilled, (state, action) => {
        if (state.user && state.user.id === action.payload.id) {
          state.user = { ...state.user, ...action.payload };
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })

      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResult>) => {
        const userFromApi = action.payload.user;
        if (!userFromApi.role) userFromApi.role = 'USER';

        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = userFromApi;

        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
        localStorage.setItem('role', userFromApi.role);
        localStorage.setItem('user', JSON.stringify(userFromApi));
      })

      .addMatcher(isPending, (state, action) => {
        if (action.type.startsWith('auth/')) {
          state.isLoading = true;
          state.error = null;
        }
      })

      .addMatcher(isRejectedWithValue, (state, action) => {
        if (action.type.startsWith('auth/')) {
          state.isLoading = false;
          state.error = (action.payload as string) || 'Unknown error';
        }
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;