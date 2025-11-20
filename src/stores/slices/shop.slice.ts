import { createSlice, createAsyncThunk, isPending, isRejectedWithValue } from '@reduxjs/toolkit';
import { shopService } from '@/services/shop.service';
import { getErrorMessage } from '@/helpers/errorHandler'; 

interface ShopState {
  shop: IShop | null;       
  shops: IShop[];           
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: ShopState = {
  shop: null,
  shops: [],
  pagination: { page: 1, limit: 10, total: 0 },
  isLoading: false,
  error: null,
};

export const fetchShops = createAsyncThunk<
  IPaginatedResult<IShop>, 
  IPaginationParams | undefined,
  { rejectValue: string }
>(
  'shop/fetchAll', 
  async (params, { rejectWithValue }) => {
    try {
      const resp = await shopService.getShopList(params);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchMyShop = createAsyncThunk<IShop, void, { rejectValue: string }>(
  'shop/fetchMyShop', 
  async (_, { rejectWithValue }) => {
    try {
      const resp = await shopService.getMyShop();
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchShopById = createAsyncThunk<IShop, string, { rejectValue: string }>(
  'shop/fetchById', 
  async (id, { rejectWithValue }) => {
    try {
      const resp = await shopService.getShopById(id);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createShop = createAsyncThunk<IShop, ICreateUpdateShopPayload, { rejectValue: string }>(
  'shop/create', 
  async (payload, { rejectWithValue }) => {
    try {
      const resp = await shopService.createShop(payload);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateShop = createAsyncThunk<IShop, { id: string; payload: ICreateUpdateShopPayload }, { rejectValue: string }>(
  'shop/update', 
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const resp = await shopService.updateShop(id, payload);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateMyShop = createAsyncThunk<IShop, IUpdateMyShopPayload, { rejectValue: string }>(
  'shop/updateMyShop', 
  async (payload, { rejectWithValue }) => {
    try {
      const resp = await shopService.updateMyShop(payload);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const verifyRegisterShop = createAsyncThunk<string, IVerifyShopPayload, { rejectValue: string }>(
  'shop/verify', 
  async (payload, { rejectWithValue }) => {
    try {
      await shopService.verifyRegisterShop(payload);
      return payload.shopId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    clearShopState: (state) => {
      state.shop = null;
      state.shops = [];
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShops.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shops = action.payload.content || [];
        state.pagination = {
          page: action.payload.currentPage,
          limit: action.payload.pageSize,
          total: action.payload.totalElements,
        };
      })

      .addCase(fetchMyShop.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shop = action.payload;
      })
      .addCase(fetchShopById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shop = action.payload;
      })
      .addCase(createShop.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shop = action.payload;
      })

      .addCase(updateMyShop.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shop = { ...state.shop, ...action.payload };
      })
      .addCase(updateShop.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.shops.findIndex(s => s.id === action.payload.id);
        if (index !== -1) state.shops[index] = action.payload;
        if (state.shop?.id === action.payload.id) state.shop = action.payload;
      })

      .addCase(verifyRegisterShop.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shops = state.shops.filter(s => s.id !== action.payload);
      })

      .addMatcher(isPending, (state, action) => {
        if (action.type.startsWith('shop/')) {
          state.isLoading = true;
          state.error = null;
        }
      })
      .addMatcher(isRejectedWithValue, (state, action) => {
        if (action.type.startsWith('shop/')) {
          state.isLoading = false;
          state.error = (action.payload as string) || 'Unknown error';
        }
      });
  },
});

export const { clearShopState } = shopSlice.actions;
export default shopSlice.reducer;