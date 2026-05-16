import { createSlice, createAsyncThunk, isPending, isRejectedWithValue } from '@reduxjs/toolkit';
import { shopThemeService } from '@/services/shopTheme.service';
import { getErrorMessage } from '@/helpers/errorHandler';

interface ShopThemeState {
  theme: ITheme | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ShopThemeState = {
  theme: null,
  isLoading: false,
  error: null,
};

export const fetchTheme = createAsyncThunk<ITheme, string, { rejectValue: string }>(
  'shopTheme/fetchTheme',
  async (shopId, { rejectWithValue }) => {
    try {
      const resp = await shopThemeService.getTheme(shopId);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createTheme = createAsyncThunk<
  ITheme,
  { shopId: string; payload: ICreateThemePayload },
  { rejectValue: string }
>(
  'shopTheme/createTheme',
  async ({ shopId, payload }, { rejectWithValue }) => {
    try {
      const resp = await shopThemeService.createTheme(shopId, payload);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateTheme = createAsyncThunk<
  ITheme,
  { shopId: string; payload: IUpdateThemePayload },
  { rejectValue: string }
>(
  'shopTheme/updateTheme',
  async ({ shopId, payload }, { rejectWithValue }) => {
    try {
      const resp = await shopThemeService.updateTheme(shopId, payload);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteTheme = createAsyncThunk<string, string, { rejectValue: string }>(
  'shopTheme/deleteTheme',
  async (shopId, { rejectWithValue }) => {
    try {
      await shopThemeService.deleteTheme(shopId);
      return shopId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const shopThemeSlice = createSlice({
  name: 'shopTheme',
  initialState,
  reducers: {
    clearThemeState: (state) => {
      state.theme = null;
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTheme.fulfilled, (state, action) => {
        state.isLoading = false;
        state.theme = action.payload;
      })
      .addCase(createTheme.fulfilled, (state, action) => {
        state.isLoading = false;
        state.theme = action.payload;
      })
      .addCase(updateTheme.fulfilled, (state, action) => {
        state.isLoading = false;
        state.theme = { ...state.theme, ...action.payload };
      })
      .addCase(deleteTheme.fulfilled, (state) => {
        state.isLoading = false;
        state.theme = null;
      })
      .addMatcher(isPending, (state, action) => {
        if (action.type.startsWith('shopTheme/')) {
          state.isLoading = true;
          state.error = null;
        }
      })
      .addMatcher(isRejectedWithValue, (state, action) => {
        if (action.type.startsWith('shopTheme/')) {
          state.isLoading = false;
          state.error = (action.payload as string) || 'Unknown error';
        }
      });
  },
});

export const { clearThemeState } = shopThemeSlice.actions;
export default shopThemeSlice.reducer;
