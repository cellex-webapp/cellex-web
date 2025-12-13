import { createSlice, createAsyncThunk, type PayloadAction, isPending, isRejectedWithValue } from '@reduxjs/toolkit';
import { customerSegmentService } from '@/services/segment.service';
import { getErrorMessage } from '@/helpers/errorHandler';
import { store } from '@/stores/store';

type RootState = ReturnType<typeof store.getState>;
type ThunkConfig = { state: RootState; rejectValue: string };

const initialState: ICustomerSegmentState = {
  segments: [],
  selectedSegment: null,
  isLoading: false,
  error: null,
};

export const fetchAllSegments = createAsyncThunk<CustomerSegmentResponse[], void, ThunkConfig>(
  'segment/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerSegmentService.getAllSegments();
      const list = Array.isArray(response.result?.content)
        ? response.result.content
        : [];
      return list.sort((a: CustomerSegmentResponse, b: CustomerSegmentResponse) => a.level - b.level);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      if (state.segment.isLoading) return false;
    },
  }
);

export const fetchSegmentById = createAsyncThunk<CustomerSegmentResponse, string, ThunkConfig>(
  'segment/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await customerSegmentService.getSegmentById(id);
      return response.result as CustomerSegmentResponse;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createSegment = createAsyncThunk<CustomerSegmentResponse, CreateCustomerSegmentRequest, ThunkConfig>(
  'segment/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await customerSegmentService.createSegment(payload);
      return response.result as CustomerSegmentResponse;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateSegment = createAsyncThunk<CustomerSegmentResponse, { id: string; payload: UpdateCustomerSegmentRequest }, ThunkConfig>(
  'segment/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await customerSegmentService.updateSegment(id, payload);
      return response.result as CustomerSegmentResponse;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteSegment = createAsyncThunk<string, string, ThunkConfig>(
  'segment/delete',
  async (id, { rejectWithValue }) => {
    try {
      await customerSegmentService.deleteSegment(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const customerSegmentSlice = createSlice({
  name: 'customerSegment',
  initialState,
  reducers: {
    clearSelectedSegment: (state) => {
      state.selectedSegment = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSegments.fulfilled, (state, action: PayloadAction<CustomerSegmentResponse[]>) => {
        state.isLoading = false;
        state.segments = action.payload;
      })
      .addCase(fetchSegmentById.fulfilled, (state, action: PayloadAction<CustomerSegmentResponse>) => {
        state.isLoading = false;
        state.selectedSegment = action.payload;
      })
      
      .addCase(createSegment.fulfilled, (state, action: PayloadAction<CustomerSegmentResponse>) => {
        state.segments.push(action.payload);
        state.segments.sort((a, b) => a.level - b.level); 
        state.isLoading = false;
      })

      .addCase(updateSegment.fulfilled, (state, action: PayloadAction<CustomerSegmentResponse>) => {
        state.segments = state.segments.map(s => s.id === action.payload.id ? action.payload : s);
        state.segments.sort((a, b) => a.level - b.level); 
        state.selectedSegment = action.payload;
        state.isLoading = false;
      })
      
      .addCase(deleteSegment.fulfilled, (state, action: PayloadAction<string>) => {
        state.segments = state.segments.filter(s => s.id !== action.payload);
        state.isLoading = false;
      })
      
      .addMatcher(isPending, (state, action) => {
        if (action.type.startsWith('segment/')) {
          state.isLoading = true;
          state.error = null;
        }
      })
      .addMatcher(isRejectedWithValue, (state, action) => {
        if (action.type.startsWith('segment/')) {
          state.isLoading = false;
          state.error = action.payload as string;
        }
      });
  },
});

export const { clearSelectedSegment } = customerSegmentSlice.actions;
export default customerSegmentSlice.reducer;