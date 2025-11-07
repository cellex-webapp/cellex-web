import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { couponService } from '@/services/coupon.service';
import { message } from 'antd';

const initialState: ICouponState = {
  campaigns: [],
  selectedCampaign: null,
  logs: [],
  myCoupons: [],
  isLoading: false,
  error: null,
};

export const fetchCampaignsByStatus = createAsyncThunk(
  'coupon/fetchByStatus',
  async (status: CampaignStatus, { rejectWithValue }) => {
    try {
      const response = await couponService.getCampaignsByStatus(status);
      return response.result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Không thể tải campaigns');
    }
  }
);

export const fetchCampaignById = createAsyncThunk(
  'coupon/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await couponService.getCampaignById(id);
      return response.result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Không tìm thấy campaign');
    }
  }
);

export const createCampaign = createAsyncThunk(
  'coupon/create',
  async (payload: CreateCampaignRequest, { rejectWithValue }) => {
    try {
      const response = await couponService.createCampaign(payload);
      return response.result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Tạo campaign thất bại');
    }
  }
);

export const updateCampaign = createAsyncThunk(
  'coupon/update',
  async ({ id, payload }: { id: string, payload: UpdateCampaignRequest }, { rejectWithValue }) => {
    try {
      const response = await couponService.updateCampaign(id, payload);
      return response.result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Cập nhật thất bại');
    }
  }
);

export const deleteCampaign = createAsyncThunk(
  'coupon/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await couponService.deleteCampaign(id);
      return id; // Trả về ID để xóa khỏi state
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Xóa thất bại');
    }
  }
);

export const distributeCampaign = createAsyncThunk(
  'coupon/distribute',
  async (payload: DistributeCampaignRequest, { rejectWithValue }) => {
    try {
      const response = await couponService.distributeCampaign(payload);
      return response.result; 
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Phát coupon thất bại');
    }
  }
);

export const fetchCampaignLogs = createAsyncThunk(
  'coupon/fetchLogs',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await couponService.getCampaignDistributionLogs(id);
      return response.result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Không thể tải logs');
    }
  }
);

export const fetchMyCoupons = createAsyncThunk(
  'coupon/fetchMyCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await couponService.getMyCoupons();
      return response.result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Không thể tải phiếu giảm giá của bạn');
    }
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
      .addCase(fetchCampaignsByStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCampaignsByStatus.fulfilled, (state, action: PayloadAction<CouponCampaignResponse[]>) => {
        state.isLoading = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaignsByStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchCampaignById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCampaignById.fulfilled, (state, action: PayloadAction<CouponCampaignResponse>) => {
        state.isLoading = false;
        state.selectedCampaign = action.payload;
      })
      .addCase(fetchCampaignById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
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
      .addCase(fetchMyCoupons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyCoupons.fulfilled, (state, action: PayloadAction<IUserCoupon[]>) => {
        state.isLoading = false;
        state.myCoupons = action.payload;
      })
      .addCase(fetchMyCoupons.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      .addMatcher(
        (action) => [createCampaign.rejected.type, updateCampaign.rejected.type, deleteCampaign.rejected.type, distributeCampaign.rejected.type].includes(action.type),
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.error = action.payload as string;
          message.error(action.payload as string); 
        }
      )
      .addMatcher(
        (action) => [createCampaign.pending.type, updateCampaign.pending.type, deleteCampaign.pending.type, distributeCampaign.pending.type].includes(action.type),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      );
    },
});

export const { clearSelectedCampaign } = couponSlice.actions;
export default couponSlice.reducer;