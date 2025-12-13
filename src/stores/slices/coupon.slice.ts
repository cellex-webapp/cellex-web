import { createSlice, createAsyncThunk, type PayloadAction, isPending, isRejectedWithValue } from '@reduxjs/toolkit';
import { couponService } from '@/services/coupon.service';
import { message } from 'antd';
import { getErrorMessage } from '@/helpers/errorHandler';
import { store } from '@/stores/store';

type RootState = ReturnType<typeof store.getState>;
type ThunkConfig = { state: RootState; rejectValue: string };

const initialState: ICouponState = {
  campaigns: [],
  selectedCampaign: null,
  logs: [],
  myCoupons: [],
  isLoading: false,
  error: null,
};

export const fetchCampaignsByStatus = createAsyncThunk<CouponCampaignResponse[], CampaignStatus, ThunkConfig>(
  'coupon/fetchByStatus',
  async (status, { rejectWithValue }) => {
    try {
      const response = await couponService.getCampaignsByStatus(status);
      const res: any = response.result as any;
      return Array.isArray(res?.content) ? (res.content as CouponCampaignResponse[]) : (res as CouponCampaignResponse[]);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      if (state.coupon.isLoading) return false;
    },
  }
);

export const fetchCampaignById = createAsyncThunk<CouponCampaignResponse, string, ThunkConfig>(
  'coupon/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await couponService.getCampaignById(id);
      return response.result as CouponCampaignResponse;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createCampaign = createAsyncThunk<CouponCampaignResponse, CreateCampaignRequest, ThunkConfig>(
  'coupon/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await couponService.createCampaign(payload);
      return response.result as CouponCampaignResponse;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateCampaign = createAsyncThunk<CouponCampaignResponse, { id: string; payload: UpdateCampaignRequest }, ThunkConfig>(
  'coupon/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await couponService.updateCampaign(id, payload);
      return response.result as CouponCampaignResponse;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteCampaign = createAsyncThunk<string, string, ThunkConfig>(
  'coupon/delete',
  async (id, { rejectWithValue }) => {
    try {
      await couponService.deleteCampaign(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const distributeCampaign = createAsyncThunk<CampaignDistributionResponse, DistributeCampaignRequest, ThunkConfig>(
  'coupon/distribute',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await couponService.distributeCampaign(payload);
      return response.result as CampaignDistributionResponse;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchCampaignLogs = createAsyncThunk<CampaignDistributionResponse[], string, ThunkConfig>(
  'coupon/fetchLogs',
  async (id, { rejectWithValue }) => {
    try {
      const response = await couponService.getCampaignDistributionLogs(id);
      const res: any = response.result as any;
      return Array.isArray(res?.content) ? (res.content as CampaignDistributionResponse[]) : (res as CampaignDistributionResponse[]);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      if (state.coupon.isLoading) return false;
    },
  }
);

export const fetchMyCoupons = createAsyncThunk<IUserCoupon[], void, ThunkConfig>(
  'coupon/fetchMyCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await couponService.getMyCoupons();
      return (response.result || []) as IUserCoupon[];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      if (state.coupon.isLoading) return false;
    },
  }
);


const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    clearSelectedCampaign: (state) => {
      state.selectedCampaign = null;
      state.logs = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaignsByStatus.fulfilled, (state, action: PayloadAction<CouponCampaignResponse[]>) => {
        state.isLoading = false;
        state.campaigns = action.payload;
      })

      .addCase(fetchCampaignById.fulfilled, (state, action: PayloadAction<CouponCampaignResponse>) => {
        state.isLoading = false;
        state.selectedCampaign = action.payload;
      })
      
      .addCase(createCampaign.fulfilled, (state, action: PayloadAction<CouponCampaignResponse>) => {
        state.campaigns.unshift(action.payload); 
      })
      
      .addCase(updateCampaign.fulfilled, (state, action: PayloadAction<CouponCampaignResponse>) => {
        state.selectedCampaign = action.payload;
        state.campaigns = state.campaigns.map(c => 
          c.id === action.payload.id ? action.payload : c
        );
      })
      
      .addCase(deleteCampaign.fulfilled, (state, action: PayloadAction<string>) => {
        state.campaigns = state.campaigns.filter(c => c.id !== action.payload);
      })

      .addCase(fetchCampaignLogs.fulfilled, (state, action: PayloadAction<CampaignDistributionResponse[]>) => {
        state.isLoading = false;
        state.logs = action.payload;
      })
      
      .addCase(distributeCampaign.fulfilled, (state, action: PayloadAction<CampaignDistributionResponse>) => {
        state.isLoading = false;
        // add new distribution log to top
        state.logs = [action.payload, ...(state.logs || [])];
        message.success('Phát coupon thành công!');
      })
      .addCase(fetchMyCoupons.fulfilled, (state, action: PayloadAction<IUserCoupon[]>) => {
        state.isLoading = false;
        state.myCoupons = action.payload;
      })
      
      .addMatcher(isPending, (state, action) => {
        if (action.type.startsWith('coupon/')) {
          state.isLoading = true;
          state.error = null;
        }
      })
      .addMatcher(isRejectedWithValue, (state, action) => {
        if (action.type.startsWith('coupon/')) {
          state.isLoading = false;
          state.error = action.payload as string;
          if (action.payload) message.error(action.payload as string);
        }
      });
    },
});

export const { clearSelectedCampaign } = couponSlice.actions;
export default couponSlice.reducer;