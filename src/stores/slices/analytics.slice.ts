import { createSlice, createAsyncThunk, isPending, isRejectedWithValue } from '@reduxjs/toolkit';
import { analyticsService } from '@/services/analytics.service';
import { getErrorMessage } from '@/helpers/errorHandler';
import { store } from '@/stores/store';

type RootState = ReturnType<typeof store.getState>;
type ThunkConfig = { state: RootState; rejectValue: string };

interface AnalyticsState {
  adminDashboard: IAdminDashboard | null;
  customerAnalytics: ICustomerAnalytics | null;
  shopAnalytics: IShopAnalytics | null;
  productAnalytics: IProductAnalytics | null;
  vendorDashboard: IVendorDashboard | null;
  
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  adminDashboard: null,
  customerAnalytics: null,
  shopAnalytics: null,
  productAnalytics: null,
  vendorDashboard: null,
  
  isLoading: false,
  error: null,
};

// 1. Admin Dashboard Thunk
export const fetchAdminDashboard = createAsyncThunk<IAdminDashboard, IAnalyticsParams | undefined, ThunkConfig>(
  'analytics/fetchAdminDashboard',
  async (params, { rejectWithValue }) => {
    try {
      const resp = await analyticsService.getAdminDashboard(params);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      if (state.analytics.isLoading) return false;
    },
  }
);

// 2. Customer Analytics Thunk
export const fetchCustomerAnalytics = createAsyncThunk<ICustomerAnalytics, IAnalyticsParams | undefined, ThunkConfig>(
  'analytics/fetchCustomerAnalytics',
  async (params, { rejectWithValue }) => {
    try {
      const resp = await analyticsService.getCustomerAnalytics(params);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      if (state.analytics.isLoading) return false;
    },
  }
);

// 3. Shop Analytics Thunk
export const fetchShopAnalytics = createAsyncThunk<IShopAnalytics, IAnalyticsParams | undefined, ThunkConfig>(
  'analytics/fetchShopAnalytics',
  async (params, { rejectWithValue }) => {
    try {
      const resp = await analyticsService.getShopAnalytics(params);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      if (state.analytics.isLoading) return false;
    },
  }
);

// 4. Product Analytics Thunk
export const fetchProductAnalytics = createAsyncThunk<IProductAnalytics, IAnalyticsParams | undefined, ThunkConfig>(
  'analytics/fetchProductAnalytics',
  async (params, { rejectWithValue }) => {
    try {
      const resp = await analyticsService.getProductAnalytics(params);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      if (state.analytics.isLoading) return false;
    },
  }
);

// 5. Vendor Dashboard Thunk
export const fetchVendorDashboard = createAsyncThunk<IVendorDashboard, IVendorAnalyticsParams, ThunkConfig>(
  'analytics/fetchVendorDashboard',
  async (params, { rejectWithValue }) => {
    try {
      const resp = await analyticsService.getVendorDashboard(params);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      if (state.analytics.isLoading) return false;
    },
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalytics: (state) => {
      state.adminDashboard = null;
      state.customerAnalytics = null;
      state.shopAnalytics = null;
      state.productAnalytics = null;
      state.vendorDashboard = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Admin Dashboard
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminDashboard = action.payload;
      })
      
      // Customer Analytics
      .addCase(fetchCustomerAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customerAnalytics = action.payload;
      })

      // Shop Analytics
      .addCase(fetchShopAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shopAnalytics = action.payload;
      })

      // Product Analytics
      .addCase(fetchProductAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productAnalytics = action.payload;
      })

      // Vendor Dashboard
      .addCase(fetchVendorDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vendorDashboard = action.payload;
      })

      // Matchers
      .addMatcher(isPending, (state, action) => {
        if (action.type.startsWith('analytics/')) {
          state.isLoading = true;
          state.error = null;
        }
      })
      .addMatcher(isRejectedWithValue, (state, action) => {
        if (action.type.startsWith('analytics/')) {
          state.isLoading = false;
          state.error = (action.payload as string) || 'Lỗi tải dữ liệu thống kê';
        }
      });
  },
});

export const { clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;