import { createSlice, createAsyncThunk, isPending, isRejectedWithValue } from '@reduxjs/toolkit';
import { userService } from '@/services/user.service';
import { getErrorMessage } from '@/helpers/errorHandler'; 

type ThunkConfig = { rejectValue: string };

interface UserState {
  users: IUser[];
  selectedUser: IUser | null;
  pagination: { page: number; limit: number; total: number };
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  pagination: { page: 1, limit: 10, total: 0 },
  isLoading: false,
  error: null,
};

export const fetchAllUsers = createAsyncThunk<
  IPaginatedResult<IUser>,
  IPaginationParams | undefined, 
  ThunkConfig
>('user/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const resp = await userService.getAllUsers(params);
    return resp.result;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchUserById = createAsyncThunk<IUser, string, ThunkConfig>(
  'user/fetchById',
  async (userId, { rejectWithValue }) => {
    try {
      const resp = await userService.getUserById(userId);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateUserProfile = createAsyncThunk<IUser, IUpdateProfilePayload, ThunkConfig>(
  'auth/updateProfile', 
  async (payload, { rejectWithValue }) => {
    try {
      const resp = await userService.updateUserProfile(payload);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const addUserAccount = createAsyncThunk<IUser, IAddAccountPayload, ThunkConfig>(
  'user/addUser',
  async (payload, { rejectWithValue }) => {
    try {
      const resp = await userService.addUserAccount(payload);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const banUser = createAsyncThunk<IUser, { userId: string; banReason?: string }, ThunkConfig>(
  'user/ban',
  async (payload, { rejectWithValue }) => {
    try {
      const resp = await userService.banUser(payload.userId, { banReason: payload.banReason });
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const unbanUser = createAsyncThunk<IUser, string, ThunkConfig>(
  'user/unban',
  async (userId, { rejectWithValue }) => {
    try {
      const resp = await userService.unbanUser(userId);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// --- SLICE ---

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
        state.users = action.payload.content || [];
        state.pagination = {
          page: action.payload.currentPage,
          limit: action.payload.pageSize,
          total: action.payload.totalElements,
        };
      })
      
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
      })
      
      .addCase(addUserAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.unshift(action.payload);
        state.pagination.total = (state.pagination.total || 0) + 1;
      })

      .addMatcher(
        (action): action is { payload: IUser; type: string } => 
          updateUserProfile.fulfilled.match(action) || 
          banUser.fulfilled.match(action) || 
          unbanUser.fulfilled.match(action),
        (state, action) => {
          const updatedUser = action.payload;
          state.isLoading = false;

          const index = state.users.findIndex((user) => user.id === updatedUser.id);
          if (index !== -1) {
            state.users[index] = { ...state.users[index], ...updatedUser };
          }
          
          if (state.selectedUser?.id === updatedUser.id) {
            state.selectedUser = { ...state.selectedUser, ...updatedUser };
          }
        }
      )
      
      .addMatcher(isPending, (state, action) => {
        if (action.type.startsWith('user/') || action.type.startsWith('auth/updateProfile')) {
          state.isLoading = true;
          state.error = null;
        }
      })
      
      .addMatcher(isRejectedWithValue, (state, action) => {
        if (action.type.startsWith('user/') || action.type.startsWith('auth/updateProfile')) {
          state.isLoading = false;
          state.error = (action.payload as string) || 'Unknown error';
        }
      });
  },
});

export const { clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;