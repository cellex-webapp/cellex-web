import { createSlice, createAsyncThunk, isPending, isRejectedWithValue } from '@reduxjs/toolkit';
import { cartService } from '@/services/cart.service';
import { getErrorMessage } from '@/helpers/errorHandler';
import { store } from '@/stores/store';

type RootState = ReturnType<typeof store.getState>;
type ThunkConfig = { state: RootState; rejectValue: string };

interface ICartState {
  cart: ICart | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ICartState = {
  cart: null,
  isLoading: false,
  error: null,
};

export const fetchMyCart = createAsyncThunk<ICart, void, ThunkConfig>(
  'cart/fetchMyCart', 
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getMyCart();
      return response.result; 
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState();
      if (state.cart.isLoading) return false;
    }
  }
);

export const addToCart = createAsyncThunk<ICart, IAddToCartRequest, ThunkConfig>(
  'cart/addToCart', 
  async (payload, { rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(payload);
      return response.result;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateCartQuantity = createAsyncThunk<ICart, IUpdateCartItemQuantityRequest, ThunkConfig>(
  'cart/updateQuantity', 
  async (payload, { rejectWithValue }) => {
    try {
      const response = await cartService.updateQuantity(payload);
      return response.result;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const setCartQuantity = createAsyncThunk<ICart, ISetCartItemQuantityRequest, ThunkConfig>(
  'cart/setQuantity', 
  async (payload, { rejectWithValue }) => {
    try {
      const response = await cartService.setQuantity(payload);
      return response.result;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const removeFromCart = createAsyncThunk<ICart, IRemoveFromCartRequest, ThunkConfig>(
  'cart/removeFromCart', 
  async (payload, { rejectWithValue }) => {
    try {
      const response = await cartService.removeFromCart(payload);
      return response.result;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const clearCart = createAsyncThunk<ICart, void, ThunkConfig>(
  'cart/clearCart', 
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.clearCart();
      return response.result;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
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
    builder
      .addMatcher(
        (action): action is { payload: ICart; type: string } => 
           action.type.startsWith('cart/') && action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.isLoading = false;
          state.cart = action.payload;
          state.error = null;
        }
      )
      .addMatcher(isPending, (state, action) => {
        if (action.type.startsWith('cart/')) {
          state.isLoading = true;
          state.error = null;
        }
      })
      .addMatcher(isRejectedWithValue, (state, action) => {
        if (action.type.startsWith('cart/')) {
          state.isLoading = false;
          state.error = (action.payload as string) || 'Unknown error';
        }
      });
  },
});

export const { clearCartOnLogout } = cartSlice.actions;
export default cartSlice.reducer;