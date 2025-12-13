import { createSlice, createAsyncThunk, isPending, isRejectedWithValue } from '@reduxjs/toolkit';
import { attributeService } from '@/services/attribute.service';
import { getErrorMessage } from '@/helpers/errorHandler';
import { store } from '@/stores/store';

type RootState = ReturnType<typeof store.getState>;
type ThunkConfig = { state: RootState; rejectValue: string };

interface AttributeState {
  attributes: IAttribute[];
  highlightAttributes: IAttribute[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: AttributeState = {
  attributes: [],
  highlightAttributes: [],
  pagination: { page: 1, limit: 10, total: 0 },
  isLoading: false,
  error: null,
};

export const fetchAttributesOfCategory = createAsyncThunk<
  IPaginatedResult<IAttribute>,
  { categoryId: string; params?: IPaginationParams },
  ThunkConfig
>(
  'attribute/fetchOfCategory',
  async ({ categoryId, params }, { rejectWithValue }) => {
    try {
      const resp = await attributeService.getAttributesOfCategory(categoryId, params);
      return resp.result;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      if (state.attribute.isLoading) return false;
    },
  }
);

export const fetchHighlightAttributesOfCategory = createAsyncThunk<
  IAttribute[],
  string,
  ThunkConfig
>(
  'attribute/fetchHighlightOfCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const resp = await attributeService.getHighlightAttributesOfCategory(categoryId);
      return resp.result;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      if (state.attribute.isLoading) return false;
    },
  }
);

export const createAttributeOfCategory = createAsyncThunk<
  IAttribute,
  { categoryId: string; payload: ICreateUpdateAttributePayload },
  ThunkConfig
>(
  'attribute/create',
  async ({ categoryId, payload }, { rejectWithValue }) => {
    try {
      const resp = await attributeService.createAttributeOfCategory(categoryId, payload);
      return resp.result;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateAttributeOfCategory = createAsyncThunk<
  IAttribute,
  { categoryId: string; payload: ICreateUpdateAttributePayload & { id: string } },
  ThunkConfig
>(
  'attribute/update',
  async ({ categoryId, payload }, { rejectWithValue }) => {
    try {
      const resp = await attributeService.updateAttributeOfCategory(categoryId, payload);
      return resp.result;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteAttributeOfCategory = createAsyncThunk<
  string, 
  { categoryId: string; attributeId: string },
  ThunkConfig
>(
  'attribute/delete',
  async ({ categoryId, attributeId }, { rejectWithValue }) => {
    try {
      await attributeService.deleteAttributeOfCategory(categoryId, attributeId);
      return attributeId;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const attributeSlice = createSlice({
  name: 'attribute',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttributesOfCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.attributes = action.payload.content || [];
        state.pagination = {
          page: action.payload.currentPage,
          limit: action.payload.pageSize,
          total: action.payload.totalElements,
        };
      })
      
      .addCase(fetchHighlightAttributesOfCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.highlightAttributes = action.payload || [];
      })

      .addCase(createAttributeOfCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        if (Array.isArray(state.attributes)) {
          state.attributes.unshift(action.payload);
        }
        state.pagination.total += 1;
      })

      .addCase(updateAttributeOfCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        if (Array.isArray(state.attributes)) {
          const index = state.attributes.findIndex((a) => a.id === action.payload.id);
          if (index !== -1) {
            state.attributes[index] = action.payload;
          }
        }
      })

      .addCase(deleteAttributeOfCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        if (Array.isArray(state.attributes)) {
          state.attributes = state.attributes.filter((a) => a.id !== action.payload);
        }
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })

      .addMatcher(isPending, (state, action) => {
        if (action.type.startsWith('attribute/')) {
          state.isLoading = true;
          state.error = null;
        }
      })

      .addMatcher(isRejectedWithValue, (state, action) => {
        if (action.type.startsWith('attribute/')) {
          state.isLoading = false;
          state.error = (action.payload as string) || 'Unknown error';
        }
      });
  },
});

export default attributeSlice.reducer;