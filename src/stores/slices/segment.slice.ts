import { createSlice, createAsyncThunk, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import { customerSegmentService } from '@/services/segment.service';

const initialState: ICustomerSegmentState = {
  segments: [],
  selectedSegment: null,
  isLoading: false,
  error: null,
};

export const fetchAllSegments = createAsyncThunk(
  'segment/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerSegmentService.getAllSegments();
      return (response.result || []).sort((a, b) => a.level - b.level);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách');
    }
  }
);

export const fetchSegmentById = createAsyncThunk(
  'segment/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await customerSegmentService.getSegmentById(id);
      return response.result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Không tìm thấy phân khúc');
    }
  }
);

export const createSegment = createAsyncThunk(
  'segment/create',
  async (payload: CreateCustomerSegmentRequest, { rejectWithValue }) => {
    try {
      const response = await customerSegmentService.createSegment(payload);
      return response.result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Tạo thất bại');
    }
  }
);

export const updateSegment = createAsyncThunk(
  'segment/update',
  async ({ id, payload }: { id: string, payload: UpdateCustomerSegmentRequest }, { rejectWithValue }) => {
    try {
      const response = await customerSegmentService.updateSegment(id, payload);
      return response.result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Cập nhật thất bại');
    }
  }
);

export const deleteSegment = createAsyncThunk(
  'segment/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await customerSegmentService.deleteSegment(id);
      return id; 
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Xóa thất bại');
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
      .addCase(fetchAllSegments.pending, (state) => { state.isLoading = true; })
      .addCase(fetchAllSegments.fulfilled, (state, action: PayloadAction<CustomerSegmentResponse[]>) => {
        state.isLoading = false;
        state.segments = action.payload; 
      })
      .addCase(fetchAllSegments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchSegmentById.pending, (state) => { state.isLoading = true; })
      .addCase(fetchSegmentById.fulfilled, (state, action: PayloadAction<CustomerSegmentResponse>) => {
        state.isLoading = false;
        state.selectedSegment = action.payload;
      })
      .addCase(fetchSegmentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
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
      
      .addMatcher(
        isAnyOf(createSegment.rejected, updateSegment.rejected, deleteSegment.rejected),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
        }
      )
      .addMatcher(
        isAnyOf(createSegment.pending, updateSegment.pending, deleteSegment.pending),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      );
  },
});

export const { clearSelectedSegment } = customerSegmentSlice.actions;
export default customerSegmentSlice.reducer;