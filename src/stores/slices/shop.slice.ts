import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { shopService } from '@/services/shop.service';

interface ShopState {
  shop: IShop | null;
  allShops: IShop[];
  pendingShops: IShop[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ShopState = {
  shop: null,
  allShops: [],
  pendingShops: [],
  isLoading: false,
  error: null,
};

export const fetchMyShop = createAsyncThunk('shop/fetchMyShop', async (_, { rejectWithValue }) => {
  try {
    const resp = await shopService.getMyShop();
    return resp.result as IShop;
  } catch (error: any) {
    const message = error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
    return rejectWithValue(message);
  }
});

export const fetchShopById = createAsyncThunk('shop/fetchById', async (id: string, { rejectWithValue }) => {
  try {
    const resp = await shopService.getShopById(id);
    return resp.result as IShop;
  } catch (error: any) {
    const message = error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
    return rejectWithValue(message);
  }
});

export const updateMyShop = createAsyncThunk('shop/updateMyShop', async (payload: IUpdateMyShopPayload, { rejectWithValue }) => {
  try {
    const resp = await shopService.updateMyShop(payload);
    return resp.result as IShop;
  } catch (error: any) {
    const message = error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
    return rejectWithValue(message);
  }
});

export const createShop = createAsyncThunk('shop/create', async (payload: ICreateUpdateShopPayload, { rejectWithValue }) => {
  try {
    const resp = await shopService.createShop(payload);
    return resp.result as IShop;
  } catch (error: any) {
    const message = error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
    return rejectWithValue(message);
  }
});

export const updateShop = createAsyncThunk('shop/update', async ({ id, payload }: { id: string; payload: ICreateUpdateShopPayload }, { rejectWithValue }) => {
  try {
    const resp = await shopService.updateShop(id, payload);
    return resp.result as IShop;
  } catch (error: any) {
    const message = error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
    return rejectWithValue(message);
  }
});

export const fetchPendingShops = createAsyncThunk('shop/fetchPending', async (_, { rejectWithValue }) => {
  try {
    const resp = await shopService.getShopList('PENDING');
    return resp.result as IShop[];
  } catch (error: any) {
    const message = error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
    return rejectWithValue(message);
  }
});

export const fetchAllShops = createAsyncThunk('shop/fetchAll', async (status: StatusVerification | undefined, { rejectWithValue }) => {
  try {
    const resp = await shopService.getShopList(status);
    return resp.result as IShop[];
  } catch (error: any) {
    const message = error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
    return rejectWithValue(message);
  }
});

export const verifyRegisterShop = createAsyncThunk('shop/verify', async (payload: IVerifyShopPayload, { rejectWithValue }) => {
  try {
    const resp = await shopService.verifyRegisterShop(payload);
    return resp.result as void;
  } catch (error: any) {
    const message = error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
    return rejectWithValue(message);
  }
});

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    clearShopState: (state) => {
      state.shop = null;
      state.allShops = [];
      state.pendingShops = [];
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyShop.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shop = action.payload;
      })
      .addCase(fetchShopById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shop = action.payload;
      })
      .addCase(updateMyShop.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.shop?.id === action.payload.id) state.shop = { ...state.shop, ...action.payload };
      })
      .addCase(updateMyShop.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMyShop.rejected, (state, action) => {
        state.isLoading = false;
        const a: any = action;
        state.error = a.payload ?? a.error?.message ?? String(a.error) ?? 'Unknown error';
      })
      .addCase(createShop.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shop = action.payload;
      })
      .addCase(updateShop.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.shop?.id === action.payload.id) state.shop = { ...state.shop, ...action.payload };
      })
      .addCase(fetchPendingShops.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingShops = action.payload;
      })
      .addCase(fetchAllShops.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allShops = action.payload;
      })
      .addCase(verifyRegisterShop.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addMatcher(
        (action) => action.type.startsWith('shop/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('shop/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          const a: any = action;
          state.error = a.payload ?? a.error?.message ?? String(a.error) ?? 'Unknown error';
        }
      );
  },
});

export const { clearShopState } = shopSlice.actions;
export default shopSlice.reducer;
