import { createSlice, createAsyncThunk, isPending, isRejectedWithValue } from '@reduxjs/toolkit';
import { productService } from '@/services/product.service';
import { getErrorMessage } from '@/helpers/errorHandler';
import { store } from '@/stores/store';

type RootState = ReturnType<typeof store.getState>;
type ThunkConfig = { state: RootState; rejectValue: string };

interface ProductState {
  products: IProduct[];
  selectedProduct: IProduct | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  pagination: { page: 1, limit: 10, total: 0 },
  isLoading: false,
  error: null,
};

export const fetchAllProducts = createAsyncThunk<IPaginatedResult<IProduct>, IPaginationParams | undefined, ThunkConfig>(
  'product/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const resp = await productService.getAllProducts(params);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState();
      if (state.product.isLoading) return false;
    }
  }
);

export const fetchProductById = createAsyncThunk<IProduct, string, ThunkConfig>(
  'product/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const resp = await productService.getProductById(id);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchProductsByShop = createAsyncThunk<IPaginatedResult<IProduct>, { shopId: string; params?: IPaginationParams }, ThunkConfig>(
  'product/fetchByShop',
  async ({ shopId, params }, { rejectWithValue }) => {
    try {
      const resp = await productService.getProductsByShop(shopId, params);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState();
      if (state.product.isLoading) return false;
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk<IPaginatedResult<IProduct>, { categoryId: string; params?: IPaginationParams }, ThunkConfig>(
  'product/fetchByCategory',
  async ({ categoryId, params }, { rejectWithValue }) => {
    try {
      const resp = await productService.getProductsByCategory(categoryId, params);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const searchProducts = createAsyncThunk<IPaginatedResult<IProduct>, { keyword: string; params?: IPaginationParams }, ThunkConfig>(
  'product/search',
  async ({ keyword, params }, { rejectWithValue }) => {
    try {
      const resp = await productService.searchProducts(keyword, params);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchMyProducts = createAsyncThunk<IPaginatedResult<IProduct>, IPaginationParams | undefined, ThunkConfig>(
  'product/fetchMyProducts',
  async (params, { rejectWithValue }) => {
    try {
      const resp = await productService.getMyProduct(params);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createProduct = createAsyncThunk<IProduct, ICreateProductPayload | FormData, ThunkConfig>(
  'product/create',
  async (data, { rejectWithValue }) => {
    try {
      const resp = await productService.createProduct(data);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateProduct = createAsyncThunk<IProduct, { id: string; data: IUpdateProductPayload | FormData }, ThunkConfig>(
  'product/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const resp = await productService.updateProduct(id, data);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteProductById = createAsyncThunk<string, string, ThunkConfig>(
  'product/delete',
  async (id, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
      })

      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.unshift(action.payload);
        state.pagination.total += 1;
      })

      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct = action.payload;
        }
      })

      .addCase(deleteProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.filter((p) => p.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.selectedProduct?.id === action.payload) {
          state.selectedProduct = null;
        }
      })

      .addMatcher(
        (action): action is { payload: IPaginatedResult<IProduct>; type: string } => {
          return (
            action.type.endsWith('/fulfilled') &&
            (action.type.includes('fetchAll') ||
              action.type.includes('fetchByShop') ||
              action.type.includes('fetchByCategory') ||
              action.type.includes('search') ||
              action.type.includes('fetchMyProducts'))
          );
        },
        (state, action) => {
          state.isLoading = false;
          state.products = action.payload.content || [];
          state.pagination = {
            page: action.payload.currentPage,
            limit: action.payload.pageSize,
            total: action.payload.totalElements,
          };
        }
      )

      .addMatcher(isPending, (state, action) => {
        if (action.type.startsWith('product/')) {
          state.isLoading = true;
          state.error = null;
        }
      })

      .addMatcher(isRejectedWithValue, (state, action) => {
        if (action.type.startsWith('product/')) {
          state.isLoading = false;
          state.error = (action.payload as string) || 'Unknown error';
        }
      });
  },
});

export const { clearSelectedProduct } = productSlice.actions;
export default productSlice.reducer;