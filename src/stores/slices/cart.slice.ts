import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { cartService } from '@/services/cart.service';

const initialState: ICartState = {
  cart: null,
  isLoading: false,
  error: null,
};

export const fetchMyCart = createAsyncThunk(
  'cart/fetchMyCart', 
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getMyCart();
      return response.result; 
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Không thể tải giỏ hàng');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart', 
  async (payload: IAddToCartRequest, { rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(payload);
      return response.result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Không thể thêm vào giỏ hàng');
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  'cart/updateQuantity', 
  async (payload: IUpdateCartItemQuantityRequest, { rejectWithValue }) => {
    try {
      const response = await cartService.updateQuantity(payload);
      return response.result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Không thể cập nhật số lượng');
    }
  }
);

export const setCartQuantity = createAsyncThunk(
  'cart/setQuantity', 
  async (payload: ISetCartItemQuantityRequest, { rejectWithValue }) => {
    try {
      const response = await cartService.setQuantity(payload);
      return response.result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Không thể đặt số lượng');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart', 
  async (payload: IRemoveFromCartRequest, { rejectWithValue }) => {
    try {
      const response = await cartService.removeFromCart(payload);
      return response.result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Không thể xóa sản phẩm');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart', 
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.clearCart();
      return response.result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Không thể làm trống giỏ hàng');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartOnLogout: (state) => {
      state.cart = null;
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    const handlePending = (state: ICartState) => {
      state.isLoading = true;
      state.error = null;
    };
    const handleRejected = (state: ICartState, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = action.payload;
    };
    const handleFulfilled = (state: ICartState, action: PayloadAction<ICart>) => {
      state.isLoading = false;
      state.cart = action.payload;
      state.error = null;
    };

    builder
      .addCase(fetchMyCart.pending, handlePending)
      .addCase(fetchMyCart.fulfilled, handleFulfilled)
      .addCase(fetchMyCart.rejected, handleRejected)
      .addCase(addToCart.pending, handlePending)
      .addCase(addToCart.fulfilled, handleFulfilled)
      .addCase(addToCart.rejected, handleRejected)
      .addCase(updateCartQuantity.pending, handlePending)
      .addCase(updateCartQuantity.fulfilled, handleFulfilled)
      .addCase(updateCartQuantity.rejected, handleRejected)
      .addCase(setCartQuantity.pending, handlePending)
      .addCase(setCartQuantity.fulfilled, handleFulfilled)
      .addCase(setCartQuantity.rejected, handleRejected)
      .addCase(removeFromCart.pending, handlePending)
      .addCase(removeFromCart.fulfilled, handleFulfilled)
      .addCase(removeFromCart.rejected, handleRejected)
      .addCase(clearCart.pending, handlePending)
      .addCase(clearCart.fulfilled, handleFulfilled)
      .addCase(clearCart.rejected, handleRejected);
  },
});

export const { clearCartOnLogout } = cartSlice.actions;
export default cartSlice.reducer;