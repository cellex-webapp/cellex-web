import { createAsyncThunk, createSlice, isPending, isRejectedWithValue } from '@reduxjs/toolkit';
import orderService from '@/services/order.service';
import { getErrorMessage } from '@/helpers/errorHandler';

const initialState: IOrderState = {
  myOrders: null,
  shopOrders: null,
  adminOrders: null,
  selectedOrder: null,
  availableCoupons: [],
  paymentUrl: null,
  isLoading: false,
  error: null,
};

// USER
type ThunkConfig = { rejectValue: string };

export const fetchMyOrders = createAsyncThunk<IPage<IOrder>, { page?: number; limit?: number; sortBy?: string; sortType?: string } | undefined, ThunkConfig>(
  'order/fetchMyOrders',
  async (params, { rejectWithValue }) => {
    try {
      const res = await orderService.getMyOrders(params);
      return res.result as IPage<IOrder>;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchOrderById = createAsyncThunk<IOrder, string, ThunkConfig>('order/fetchById', async (orderId, { rejectWithValue }) => {
  try {
    const res = await orderService.getOrderById(orderId);
    return res.result as IOrder;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchAvailableCoupons = createAsyncThunk<AvailableCouponResponse[], string, ThunkConfig>(
  'order/fetchAvailableCoupons',
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await orderService.getAvailableCoupons(orderId);
      return (res.result || []) as AvailableCouponResponse[];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const applyCouponToOrder = createAsyncThunk<IOrder, { orderId: string; body: ApplyCouponRequest }, ThunkConfig>(
  'order/applyCoupon',
  async ({ orderId, body }, { rejectWithValue }) => {
    try {
      const res = await orderService.applyCoupon(orderId, body);
      return res.result as IOrder;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const removeCouponFromOrder = createAsyncThunk<IOrder, string, ThunkConfig>('order/removeCoupon', async (orderId, { rejectWithValue }) => {
  try {
    const res = await orderService.removeCoupon(orderId);
    return res.result as IOrder;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const checkoutOrder = createAsyncThunk<{ order: IOrder; paymentUrl?: string }, { orderId: string; body: CheckoutOrderRequest }, ThunkConfig>(
  'order/checkout',
  async ({ orderId, body }, { rejectWithValue }) => {
    try {
      const res = await orderService.checkoutOrder(orderId, body);
      const paymentUrl = (res as any)?.paymentUrl || (res.result as any)?.paymentUrl || (res as any)?.result?.payment_url || (res as any)?.url;
      return { order: res.result as IOrder, paymentUrl };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const cancelOrder = createAsyncThunk<IOrder, string, ThunkConfig>('order/cancel', async (orderId, { rejectWithValue }) => {
  try {
    const res = await orderService.cancelOrder(orderId);
    return res.result as IOrder;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const confirmDelivery = createAsyncThunk<IOrder, string, ThunkConfig>('order/confirmDelivery', async (orderId, { rejectWithValue }) => {
  try {
    const res = await orderService.confirmDelivery(orderId);
    return res.result as IOrder;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// VENDOR
export const fetchShopOrders = createAsyncThunk<IPage<IOrder>, { page?: number; limit?: number; sortBy?: string; sortType?: string } | undefined, ThunkConfig>(
  'order/fetchShopOrders',
  async (params, { rejectWithValue }) => {
    try {
      const res = await orderService.getShopOrders(params);
      return res.result as IPage<IOrder>;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchShopOrdersByStatus = createAsyncThunk<IPage<IOrder>, { status: OrderStatus; params?: { page?: number; limit?: number; sortBy?: string; sortType?: string } }, ThunkConfig>(
  'order/fetchShopOrdersByStatus',
  async ({ status, params }, { rejectWithValue }) => {
    try {
      const res = await orderService.getShopOrdersByStatus(status, params);
      return res.result as IPage<IOrder>;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const vendorConfirmOrder = createAsyncThunk<IOrder, string, ThunkConfig>('order/confirmOrder', async (orderId, { rejectWithValue }) => {
  try {
    const res = await orderService.confirmOrder(orderId);
    return res.result as IOrder;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const vendorShipOrder = createAsyncThunk<IOrder, string, ThunkConfig>('order/shipOrder', async (orderId, { rejectWithValue }) => {
  try {
    const res = await orderService.shipOrder(orderId);
    return res.result as IOrder;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// ADMIN
export const fetchAdminOrders = createAsyncThunk<IPage<IOrder>, {
  userId?: string;
  vendorId?: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortType?: string;
} | undefined, ThunkConfig>(
  'order/fetchAdminOrders',
  async (params, { rejectWithValue }) => {
    try {
      const res = await orderService.getAllOrdersForAdmin(params);
      return res.result as IPage<IOrder>;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearSelectedOrder(state) {
      state.selectedOrder = null;
    },
    clearAvailableCoupons(state) {
      state.availableCoupons = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fulfilled mappings
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myOrders = action.payload;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchAvailableCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableCoupons = action.payload || [];
      })
      .addCase(applyCouponToOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(removeCouponFromOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(checkoutOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload.order;
        state.paymentUrl = action.payload.paymentUrl || null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(confirmDelivery.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchShopOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shopOrders = action.payload;
      })
      .addCase(fetchShopOrdersByStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shopOrders = action.payload;
      })
      .addCase(vendorConfirmOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(vendorShipOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminOrders = action.payload;
      })
      // Loading (place after addCase due to RTK type order constraints)
      .addMatcher(isPending, (state, action) => {
        if (action.type.startsWith('order/')) {
          state.isLoading = true;
          state.error = null;
        }
      })
      // Rejected
      .addMatcher(isRejectedWithValue, (state, action) => {
        if (action.type.startsWith('order/')) {
          state.isLoading = false;
          state.error = (action.payload as string) || 'Something went wrong';
        }
      });
  },
});

export const { clearSelectedOrder, clearAvailableCoupons } = orderSlice.actions;

export default orderSlice.reducer;