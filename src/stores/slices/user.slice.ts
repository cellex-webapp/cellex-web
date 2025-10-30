import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '@/services/user.service';

interface UserState {
  users: IUser[];
  selectedUser: IUser | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
};

export const fetchAllUsers = createAsyncThunk('user/fetchAll', async (_, { rejectWithValue }) => {
  try {
  const resp = await userService.getAllUsers();
  return resp.result as IUser[];
  } catch (error: any) {
    const message =
      error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
    return rejectWithValue(message);
  }
});

export const fetchUserById = createAsyncThunk(
  'user/fetchById',
  async (userId: string, { rejectWithValue }) => {
    try {
      const resp = await userService.getUserById(userId);
      return resp.result as IUser;
    } catch (error: any) {
      const message =
      error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
      return rejectWithValue(message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile', 
  async (payload: IUpdateProfilePayload, { rejectWithValue }) => {
    try {
        const resp = await userService.updateUserProfile(payload);
        return resp.result as IUser;
    } catch (error: any) {
        const message =
          error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
        return rejectWithValue(message);
    }
  }
);

export const addUserAccount = createAsyncThunk(
  'user/addUser',
  async (payload: IAddAccountPayload, { rejectWithValue }) => {
    try {
        const resp = await userService.addUserAccount(payload);
        return resp.result as IUser;
    } catch (error: any) {
        const message =
          error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
        return rejectWithValue(message);
    }
  }
);

export const banUser = createAsyncThunk(
  'user/ban',
  async (
    payload: { userId: string; banReason?: string },
    { rejectWithValue }
  ) => {
    try {
      const resp = await userService.banUser(payload.userId, { banReason: payload.banReason });
      return resp.result as IUser;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
      return rejectWithValue(message);
    }
  }
);

export const unbanUser = createAsyncThunk(
  'user/unban',
  async (userId: string, { rejectWithValue }) => {
    try {
      const resp = await userService.unbanUser(userId);
      return resp.result as IUser;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
      return rejectWithValue(message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...action.payload };
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = { ...state.selectedUser, ...action.payload };
        }
      })
      .addCase(addUserAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.unshift(action.payload);
      })
      .addCase(banUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...action.payload };
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = { ...state.selectedUser, ...action.payload };
        }
      })
      .addCase(unbanUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...action.payload };
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = { ...state.selectedUser, ...action.payload };
        }
      })
      .addMatcher(
        (action) => action.type.startsWith('user/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('user/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          const a: any = action;
          state.error = a.payload ?? a.error?.message ?? String(a.error) ?? 'Unknown error';
        }
      );
  },
});

export const { clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;