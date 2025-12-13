import { createAsyncThunk, createSlice, isPending, isRejectedWithValue } from '@reduxjs/toolkit';
import vnpayService from '@/services/vnpay.service';
import { getErrorMessage } from '@/helpers/errorHandler';
import { store } from '@/stores/store';

const initialState: VnpayState = {
  paymentUrl: null,
  paymentStatus: null,
  isLoading: false,
  error: null,
};

type RootState = ReturnType<typeof store.getState>;
type ThunkConfig = { state: RootState; rejectValue: string };

export const createVnpayPayment = createAsyncThunk<VnpayPaymentResponse, VnpayPaymentRequest, ThunkConfig>(
  'vnpay/createPayment',
  async (body, { rejectWithValue }) => {
    try {
      return await vnpayService.createPayment(body);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      if (state.vnpay.isLoading) return false;
    },
  }
);

export const fetchVnpayStatus = createAsyncThunk<any, string, ThunkConfig>(
  'vnpay/fetchStatus',
  async (orderId, { rejectWithValue }) => {
    try {
      return await vnpayService.getPaymentStatus(orderId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      if (state.vnpay.isLoading) return false;
    },
  }
);

const vnpaySlice = createSlice({
  name: 'vnpay',
  initialState,
  reducers: {
    clearVnpayState(state) {
      state.paymentUrl = null;
      state.paymentStatus = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createVnpayPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentUrl = action.payload.paymentUrl;
      })
      .addCase(fetchVnpayStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentStatus = action.payload;
      })
      .addMatcher(isPending, (state, action) => {
        if (action.type.startsWith('vnpay/')) {
          state.isLoading = true;
          state.error = null;
        }
      })
      .addMatcher(isRejectedWithValue, (state, action) => {
        if (action.type.startsWith('vnpay/')) {
          state.isLoading = false;
          state.error = (action.payload as string) || 'Có lỗi xảy ra';
        }
      });
  },
});

export const { clearVnpayState } = vnpaySlice.actions;

export default vnpaySlice.reducer;
