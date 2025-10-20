import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attributeService } from '@/services/attribute.service';

interface AttributeState {
  attributes: IAttribute[];
  highlightAttributes: IAttribute[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AttributeState = {
  attributes: [],
  highlightAttributes: [],
  isLoading: false,
  error: null,
};

export const fetchAttributesOfCategory = createAsyncThunk(
  'attribute/fetchOfCategory',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const resp = await attributeService.getAttributesOfCategory(categoryId);
      return resp.result as IAttribute[];
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? JSON.stringify(err);
      return rejectWithValue(message);
    }
  }
);

export const fetchHighlightAttributesOfCategory = createAsyncThunk(
  'attribute/fetchHighlightOfCategory',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const resp = await attributeService.getHighlightAttributesOfCategory(categoryId);
      return resp.result as IAttribute[];
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? JSON.stringify(err);
      return rejectWithValue(message);
    }
  }
);

export const createAttributeOfCategory = createAsyncThunk(
  'attribute/create',
  async ({ categoryId, payload }: { categoryId: string; payload: ICreateUpdateAttributePayload }, { rejectWithValue }) => {
    try {
      const resp = await attributeService.createAttributeOfCategory(categoryId, payload);
      return resp.result as IAttribute;
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? JSON.stringify(err);
      return rejectWithValue(message);
    }
  }
);

export const updateAttributeOfCategory = createAsyncThunk(
  'attribute/update',
  async ({ categoryId, payload }: { categoryId: string; payload: ICreateUpdateAttributePayload & { id: string } }, { rejectWithValue }) => {
    try {
      const resp = await attributeService.updateAttributeOfCategory(categoryId, payload as any);
      return resp.result as IAttribute;
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? JSON.stringify(err);
      return rejectWithValue(message);
    }
  }
);

export const deleteAttributeOfCategory = createAsyncThunk(
  'attribute/delete',
  async ({ categoryId, attributeId }: { categoryId: string; attributeId: string }, { rejectWithValue }) => {
    try {
      await attributeService.deleteAttributeOfCategory(categoryId, attributeId);
      return { attributeId };
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? JSON.stringify(err);
      return rejectWithValue(message);
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
        state.attributes = action.payload;
      })
      .addCase(fetchHighlightAttributesOfCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.highlightAttributes = action.payload;
      })
      .addCase(createAttributeOfCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.attributes = [action.payload, ...state.attributes];
      })
      .addCase(updateAttributeOfCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.attributes = state.attributes.map((a) => (a.id === action.payload.id ? action.payload : a));
      })
      .addCase(deleteAttributeOfCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.attributes = state.attributes.filter((a) => a.id !== action.payload.attributeId);
      })
      .addMatcher(
        (action) => action.type.startsWith('attribute/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('attribute/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          const a: any = action;
          state.error = a.payload ?? a.error?.message ?? String(a.error) ?? 'Unknown error';
        }
      );
  },
});

export default attributeSlice.reducer;
