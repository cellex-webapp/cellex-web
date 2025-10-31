import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '@/services/product.service';

interface ProductState {
    products: IProduct[];
    selectedProduct: IProduct | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: ProductState = {
    products: [],
    selectedProduct: null,
    isLoading: false,
    error: null,
};

export const fetchProductById = createAsyncThunk(
    'product/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            const resp = await productService.getProductById(id);
            return resp.result as IProduct;
        } catch (error: any) {
            const message = error?.response?.data?.message ?? error?.message ?? JSON.stringify(error);
            return rejectWithValue(message);
        }
    }
);

export const updateProduct = createAsyncThunk(
    'product/update',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const resp = await productService.updateProduct(id, data);
            return resp.result as IProduct;
        } catch (error: any) {
            const message = error?.response?.data?.message ?? error?.message ?? JSON.stringify(error);
            return rejectWithValue(message);
        }
    }
);

export const fetchProductsByShop = createAsyncThunk(
    'product/fetchByShop',
    async ({ shopId, pageable }: { shopId: string; pageable?: IPageable }, { rejectWithValue }) => {
        try {
            const resp = await productService.getProductsByShop(shopId, pageable);
            return resp.result as IPage<IProduct>;
        } catch (error: any) {
            const message = error?.response?.data?.message ?? error?.message ?? JSON.stringify(error);
            return rejectWithValue(message);
        }
    }
);

export const searchProducts = createAsyncThunk(
    'product/search',
    async ({ keyword, pageable }: { keyword: string; pageable?: IPageable }, { rejectWithValue }) => {
        try {
            const resp = await productService.searchProducts(keyword, pageable);
            return resp.result as IPage<IProduct>;
        } catch (error: any) {
            const message = error?.response?.data?.message ?? error?.message ?? JSON.stringify(error);
            return rejectWithValue(message);
        }
    }
);

export const fetchProductsByCategory = createAsyncThunk(
    'product/fetchByCategory',
    async ({ categoryId, pageable }: { categoryId: string; pageable?: IPageable }, { rejectWithValue }) => {
        try {
            const resp = await productService.getProductsByCategory(categoryId, pageable);
            return resp.result as IPage<IProduct>;
        } catch (error: any) {
            const message = error?.response?.data?.message ?? error?.message ?? JSON.stringify(error);
            return rejectWithValue(message);
        }
    }
);

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedProduct = action.payload;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.isLoading = false;
                // update in list if exists
                const idx = state.products.findIndex((p) => p.id === action.payload.id);
                if (idx !== -1) state.products[idx] = action.payload;
                // set selected if matches
                if (state.selectedProduct?.id === action.payload.id) state.selectedProduct = action.payload;
            })
            .addCase(fetchProductsByShop.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products = action.payload.content || [];
            })
            .addCase(searchProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products = action.payload.content || [];
            })
            .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products = action.payload.content || [];
            })
            .addMatcher(
                (action) => action.type.startsWith('product/') && action.type.endsWith('/pending'),
                (state) => {
                    state.isLoading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                (action) => action.type.startsWith('product/') && action.type.endsWith('/rejected'),
                (state, action) => {
                    state.isLoading = false;
                    const a: any = action;
                    state.error = a.payload ?? a.error?.message ?? String(a.error) ?? 'Unknown error';
                }
            );
    },
});

export default productSlice.reducer;
