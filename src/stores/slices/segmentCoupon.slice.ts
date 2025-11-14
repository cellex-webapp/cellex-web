import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { couponService } from '@/services/coupon.service';

const initialState: SegmentCouponState = {
  items: [],
  selected: null,
  bySegment: {},
  isLoading: false,
  error: null,
};

export const fetchAllSegmentCoupons = createAsyncThunk('segmentCoupon/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const resp = await couponService.getAllSegmentCoupons();
    return resp.result as SegmentCouponResponse[];
  } catch (error: any) {
    const message = error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
    return rejectWithValue(message);
  }
});

export const fetchSegmentCouponById = createAsyncThunk('segmentCoupon/fetchById', async (id: string, { rejectWithValue }) => {
  try {
    const resp = await couponService.getSegmentCouponById(id);
    return resp.result as SegmentCouponResponse;
  } catch (error: any) {
    const message = error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
    return rejectWithValue(message);
  }
});

export const fetchSegmentCouponsBySegmentId = createAsyncThunk('segmentCoupon/fetchBySegmentId', async (segmentId: string, { rejectWithValue }) => {
  try {
    const resp = await couponService.getSegmentCouponsBySegmentId(segmentId);
    return { segmentId, items: resp.result as SegmentCouponResponse[] };
  } catch (error: any) {
    const message = error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
    return rejectWithValue(message);
  }
});

export const createSegmentCoupon = createAsyncThunk('segmentCoupon/create', async (payload: CreateSegmentCouponRequest, { rejectWithValue }) => {
  try {
    const resp = await couponService.createSegmentCoupon(payload);
    return resp.result as SegmentCouponResponse;
  } catch (error: any) {
    const message = error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
    return rejectWithValue(message);
  }
});

export const updateSegmentCoupon = createAsyncThunk(
  'segmentCoupon/update',
  async ({ id, payload }: { id: string; payload: UpdateSegmentCouponRequest }, { rejectWithValue }) => {
    try {
      const resp = await couponService.updateSegmentCoupon(id, payload);
      return resp.result as SegmentCouponResponse;
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
      return rejectWithValue(message);
    }
  }
);

export const deleteSegmentCoupon = createAsyncThunk('segmentCoupon/delete', async (id: string, { rejectWithValue }) => {
  try {
    await couponService.deleteSegmentCoupon(id);
    return id;
  } catch (error: any) {
    const message = error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
    return rejectWithValue(message);
  }
});

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
      .addMatcher(
        (action) => action.type.startsWith('segmentCoupon/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('segmentCoupon/') && action.type.endsWith('/rejected'),
        (state, action: any) => {
          state.isLoading = false;
          state.error = action.payload ?? action.error?.message ?? 'Unknown error';
        }
      );
  },
});

export const { clearSegmentCouponState } = segmentCouponSlice.actions;
export default segmentCouponSlice.reducer;
