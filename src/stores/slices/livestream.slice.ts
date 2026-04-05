import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import livestreamService from '@/services/livestream.service';

const isSuccessResponse = (code?: number) => code === 1000 || code === 200;

export const fetchActiveSessions = createAsyncThunk(
  'livestream/fetchActiveSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await livestreamService.getActiveSessions();
      if (isSuccessResponse(response.code)) return response.result;
      return rejectWithValue(response.message || 'Lỗi tải danh sách phiên livestream');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải danh sách phiên livestream');
    }
  }
);

export const fetchViewerToken = createAsyncThunk(
  'livestream/fetchViewerToken',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await livestreamService.getViewerToken(sessionId);
      if (isSuccessResponse(response.code)) return response.result;
      return rejectWithValue(response.message || 'Lỗi xin cấp quyền vào phòng');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi xin cấp quyền vào phòng');
    }
  }
);

const initialState: ILivestreamState = {
  activeSessions: [],
  currentSession: null,
  viewerToken: null,
  isLoading: false,
  error: null,
};

const livestreamSlice = createSlice({
  name: 'livestream',
  initialState,
  reducers: {
    clearCurrentSession: (state) => {
      state.currentSession = null;
      state.viewerToken = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Xử lý Active Sessions
      .addCase(fetchActiveSessions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveSessions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeSessions = action.payload;
      })
      .addCase(fetchActiveSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Xử lý Viewer Token
      .addCase(fetchViewerToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchViewerToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.viewerToken = action.payload;
      })
      .addCase(fetchViewerToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentSession } = livestreamSlice.actions;
export default livestreamSlice.reducer;