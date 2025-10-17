import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryService } from '@/services/category.service';

interface CategoryState {
  categories: ICategory[];
  selectedCategory: ICategory | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
};

export const fetchAllCategories = createAsyncThunk('category/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const resp: any = await categoryService.getAllCategories();
    return resp.result as ICategory[];
  } catch (error: any) {
    const message =
      error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
    return rejectWithValue(message);
  }
});

export const createCategory = createAsyncThunk(
  'category/create',
  async (payload: ICreateCategoryPayload, { rejectWithValue }) => {
    try {
      const resp: any = await categoryService.createCategory(payload);
      return resp.result as ICategory;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
      return rejectWithValue(message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'category/update',
  async (payload: IUpdateCategoryPayload, { rejectWithValue }) => {
    try {
      const resp: any = await categoryService.updateCategory(payload);
      return resp.result as ICategory;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
      return rejectWithValue(message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'category/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(id);
      return id;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? error?.data?.message ?? JSON.stringify(error);
      return rejectWithValue(message);
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories.unshift(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.categories.findIndex((cat) => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = state.categories.filter((cat) => cat.id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('category/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('category/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          const a: any = action;
          state.error = a.payload ?? a.error?.message ?? String(a.error) ?? 'Unknown error';
        }
      );
  },
});

export default categorySlice.reducer;