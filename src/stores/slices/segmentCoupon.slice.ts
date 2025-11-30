import { createAsyncThunk, createSlice, isPending, isRejectedWithValue } from '@reduxjs/toolkit';
import { couponService } from '@/services/coupon.service';
import { getErrorMessage } from '@/helpers/errorHandler';

const initialState: SegmentCouponState = {
  items: [],
  selected: null,
  bySegment: {},
  isLoading: false,
  error: null,
};

type ThunkConfig = { rejectValue: string };

export const fetchAllSegmentCoupons = createAsyncThunk<SegmentCouponResponse[], void, ThunkConfig>(
  'segmentCoupon/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const resp = await couponService.getAllSegmentCoupons();
      const res: any = resp.result as any;
      return Array.isArray(res?.content) ? (res.content as SegmentCouponResponse[]) : (res as SegmentCouponResponse[]);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchSegmentCouponById = createAsyncThunk<SegmentCouponResponse, string, ThunkConfig>(
  'segmentCoupon/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const resp = await couponService.getSegmentCouponById(id);
      return resp.result as SegmentCouponResponse;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchSegmentCouponsBySegmentId = createAsyncThunk<{ segmentId: string; items: SegmentCouponResponse[] }, string, ThunkConfig>(
  'segmentCoupon/fetchBySegmentId',
  async (segmentId, { rejectWithValue }) => {
    try {
      const resp = await couponService.getSegmentCouponsBySegmentId(segmentId);
      const res: any = resp.result as any;
      const items = Array.isArray(res?.content) ? (res.content as SegmentCouponResponse[]) : (res as SegmentCouponResponse[]);
      return { segmentId, items };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createSegmentCoupon = createAsyncThunk<SegmentCouponResponse, CreateSegmentCouponRequest, ThunkConfig>(
  'segmentCoupon/create',
  async (payload, { rejectWithValue }) => {
    try {
      const resp = await couponService.createSegmentCoupon(payload);
      return resp.result as SegmentCouponResponse;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateSegmentCoupon = createAsyncThunk<SegmentCouponResponse, { id: string; payload: UpdateSegmentCouponRequest }, ThunkConfig>(
  'segmentCoupon/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const resp = await couponService.updateSegmentCoupon(id, payload);
      return resp.result as SegmentCouponResponse;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteSegmentCoupon = createAsyncThunk<string, string, ThunkConfig>(
  'segmentCoupon/delete',
  async (id, { rejectWithValue }) => {
    try {
      await couponService.deleteSegmentCoupon(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const segmentCouponSlice = createSlice({
  name: 'segmentCoupon',
  initialState,
  reducers: {
    clearSegmentCouponState: (state) => {
      state.items = [];
      state.selected = null;
      state.bySegment = {};
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSegmentCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchSegmentCouponById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchSegmentCouponsBySegmentId.fulfilled, (state, action) => {
        state.isLoading = false;
        const { segmentId, items } = action.payload as { segmentId: string; items: SegmentCouponResponse[] };
        state.bySegment[segmentId] = items;
      })
      .addCase(createSegmentCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(updateSegmentCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.items.findIndex((x) => x.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
        if (state.selected?.id === action.payload.id) state.selected = action.payload;
      })
      .addCase(deleteSegmentCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter((x) => x.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
      })
      .addMatcher(isPending, (state, action) => {
        if (action.type.startsWith('segmentCoupon/')) {
          state.isLoading = true;
          state.error = null;
        }
      })
      .addMatcher(isRejectedWithValue, (state, action) => {
        if (action.type.startsWith('segmentCoupon/')) {
          state.isLoading = false;
          state.error = (action.payload as string) || 'Unknown error';
        }
      });
  },
});

export const { clearSegmentCouponState } = segmentCouponSlice.actions;
export default segmentCouponSlice.reducer;
