import { createSlice, createAsyncThunk, isPending, isRejectedWithValue } from '@reduxjs/toolkit';
import { userService } from '@/services/user.service';
import { userAddressService } from '@/services/address.service';
import { getErrorMessage } from '@/helpers/errorHandler';
import { store } from '@/stores/store';

type RootState = ReturnType<typeof store.getState>;
type ThunkConfig = { state: RootState; rejectValue: string };

interface UserState {
  users: IUser[];
  selectedUser: IUser | null;
  myAddresses: IUserAddress[];
  pagination: { page: number; limit: number; total: number };
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  myAddresses: [],
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
},
{
  condition: (_, { getState }) => {
    const state = getState();
    if (state.user.isLoading) return false;
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

export const fetchMyAddresses = createAsyncThunk<IUserAddress[], void, ThunkConfig>(
  'user/fetchMyAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const resp = await userAddressService.getMyAddresses();
      return resp.result || [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createMyAddress = createAsyncThunk<IUserAddress, ICreateUserAddressPayload, ThunkConfig>(
  'user/createMyAddress',
  async (payload, { rejectWithValue }) => {
    try {
      const resp = await userAddressService.createAddress(payload);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateMyAddress = createAsyncThunk<IUserAddress, { id: string; payload: IUpdateUserAddressPayload }, ThunkConfig>(
  'user/updateMyAddress',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const resp = await userAddressService.updateAddress(id, payload);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteMyAddress = createAsyncThunk<string, string, ThunkConfig>(
  'user/deleteMyAddress',
  async (id, { rejectWithValue }) => {
    try {
      await userAddressService.deleteAddress(id);
      return id; // Trả về ID để xóa khỏi state
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

      .addCase(fetchMyAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myAddresses = action.payload;
      })
      .addCase(createMyAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        // Nếu địa chỉ mới là mặc định, gỡ mặc định của các địa chỉ cũ
        if (action.payload.default) {
          state.myAddresses.forEach(addr => addr.default = false);
        }
        state.myAddresses.unshift(action.payload);
      })
      .addCase(updateMyAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.default) {
          state.myAddresses.forEach(addr => addr.default = false);
        }
        const index = state.myAddresses.findIndex(addr => addr.id === action.payload.id);
        if (index !== -1) {
          state.myAddresses[index] = action.payload;
        }
      })
      .addCase(deleteMyAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myAddresses = state.myAddresses.filter(addr => addr.id !== action.payload);
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