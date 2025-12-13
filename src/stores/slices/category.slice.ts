import { createSlice, createAsyncThunk, isPending, isRejectedWithValue } from '@reduxjs/toolkit';
import { categoryService } from '@/services/category.service';
import { getErrorMessage } from '@/helpers/errorHandler';
import { store } from '@/stores/store';

type RootState = ReturnType<typeof store.getState>;
type ThunkConfig = { state: RootState; rejectValue: string };

interface CategoryState {
  categories: ICategory[]; 
  pagination: {            
    page: number;
    limit: number;
    total: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  pagination: { page: 1, limit: 10, total: 0 },
  isLoading: false,
  error: null,
};

export const fetchAllCategories = createAsyncThunk<
  IPaginatedResult<ICategory>, 
  IPaginationParams | undefined, 
  ThunkConfig
>(
  'category/fetchAll', 
  async (params, { rejectWithValue }) => {
    try {
      const resp = await categoryService.getAllCategories(params);
      return resp.result; 
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState();
      if (state.category.isLoading) return false;
    }
  }
);

export const createCategory = createAsyncThunk<ICategory, ICreateCategoryPayload, ThunkConfig>(
  'category/create',
  async (payload, { rejectWithValue }) => {
    try {
      const resp = await categoryService.createCategory(payload);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateCategory = createAsyncThunk<ICategory, IUpdateCategoryPayload, ThunkConfig>(
  'category/update',
  async (payload, { rejectWithValue }) => {
    try {
      const resp = await categoryService.updateCategory(payload);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteCategory = createAsyncThunk<string, string, ThunkConfig>(
  'category/delete',
  async (id, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
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
        state.categories = action.payload.content || [];
        state.pagination = {
          page: action.payload.currentPage,
          limit: action.payload.pageSize,
          total: action.payload.totalElements,
        };
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        if (Array.isArray(state.categories)) {
             state.categories.unshift(action.payload);
        }
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        if (Array.isArray(state.categories)) {
            const index = state.categories.findIndex((cat) => cat.id === action.payload.id);
            if (index !== -1) {
              state.categories[index] = action.payload;
            }
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = state.categories.filter((cat) => cat.id !== action.payload);
      })
      
      .addMatcher(isPending, (state, action) => {
        if (action.type.startsWith('category/')) {
          state.isLoading = true;
          state.error = null;
        }
      })
      
      .addMatcher(isRejectedWithValue, (state, action) => {
        if (action.type.startsWith('category/')) {
           state.isLoading = false;
           state.error = (action.payload as string) || 'Unknown error';
        }
      });
  },
});

export default categorySlice.reducer;