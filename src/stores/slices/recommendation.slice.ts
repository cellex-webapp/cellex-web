/**
 * Recommendation Redux Slice
 * Manages state for product recommendations
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { recommendationService } from '@/services/recommendation.service';
import type { IRecommendationResponse, IRecommendationParams } from '@/services/recommendation.service';
import { getErrorMessage } from '@/helpers/errorHandler';
import { store } from '@/stores/store';

type RootState = ReturnType<typeof store.getState>;
type ThunkConfig = { state: RootState; rejectValue: string };

export interface RecommendationState {
  myRecommendations: IRecommendationResponse[];
  userRecommendations: Record<string, IRecommendationResponse[]>;
  isLoading: boolean;
  isComputing: boolean;
  error: string | null;
  lastFetched: string | null;
  selectedCategory: string | null;
}

const initialState: RecommendationState = {
  myRecommendations: [],
  userRecommendations: {},
  isLoading: false,
  isComputing: false,
  error: null,
  lastFetched: null,
  selectedCategory: null,
};

// Async Thunks

/**
 * Fetch recommendations for current user
 */
export const fetchMyRecommendations = createAsyncThunk<
  IRecommendationResponse[],
  IRecommendationParams | undefined,
  ThunkConfig
>(
  'recommendation/fetchMy',
  async (params, { rejectWithValue }) => {
    try {
      const resp = await recommendationService.getMyRecommendations(params);
      return resp.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Fetch recommendations for a specific user
 */
export const fetchUserRecommendations = createAsyncThunk<
  { userId: string; recommendations: IRecommendationResponse[] },
  { userId: string; params?: IRecommendationParams },
  ThunkConfig
>(
  'recommendation/fetchUser',
  async ({ userId, params }, { rejectWithValue }) => {
    try {
      const resp = await recommendationService.getUserRecommendations(userId, params);
      return { userId, recommendations: resp.result };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Fetch precomputed recommendations for a user
 */
export const fetchPrecomputedRecommendations = createAsyncThunk<
  { userId: string; recommendations: IRecommendationResponse[] },
  { userId: string; limit?: number },
  ThunkConfig
>(
  'recommendation/fetchPrecomputed',
  async ({ userId, limit }, { rejectWithValue }) => {
    try {
      const resp = await recommendationService.getPrecomputedRecommendations(userId, limit);
      return { userId, recommendations: resp.result };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Trigger computation for a specific user (Admin)
 */
export const computeRecommendationsForUser = createAsyncThunk<
  string,
  string,
  ThunkConfig
>(
  'recommendation/computeForUser',
  async (userId, { rejectWithValue }) => {
    try {
      await recommendationService.computeForUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Trigger computation for all users (Admin)
 */
export const computeRecommendationsForAll = createAsyncThunk<
  void,
  void,
  ThunkConfig
>(
  'recommendation/computeForAll',
  async (_, { rejectWithValue }) => {
    try {
      await recommendationService.computeForAll();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Slice
const recommendationSlice = createSlice({
  name: 'recommendation',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    clearMyRecommendations: (state) => {
      state.myRecommendations = [];
      state.lastFetched = null;
    },
    clearUserRecommendations: (state, action: PayloadAction<string>) => {
      delete state.userRecommendations[action.payload];
    },
    clearAllRecommendations: (state) => {
      state.myRecommendations = [];
      state.userRecommendations = {};
      state.lastFetched = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch my recommendations
      .addCase(fetchMyRecommendations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myRecommendations = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchMyRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Có lỗi xảy ra khi tải gợi ý';
      })
      
      // Fetch user recommendations
      .addCase(fetchUserRecommendations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userRecommendations[action.payload.userId] = action.payload.recommendations;
      })
      .addCase(fetchUserRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Có lỗi xảy ra khi tải gợi ý';
      })
      
      // Fetch precomputed recommendations
      .addCase(fetchPrecomputedRecommendations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPrecomputedRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userRecommendations[action.payload.userId] = action.payload.recommendations;
      })
      .addCase(fetchPrecomputedRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Có lỗi xảy ra khi tải gợi ý';
      })
      
      // Compute for user
      .addCase(computeRecommendationsForUser.pending, (state) => {
        state.isComputing = true;
        state.error = null;
      })
      .addCase(computeRecommendationsForUser.fulfilled, (state) => {
        state.isComputing = false;
      })
      .addCase(computeRecommendationsForUser.rejected, (state, action) => {
        state.isComputing = false;
        state.error = action.payload ?? 'Có lỗi xảy ra khi tính toán gợi ý';
      })
      
      // Compute for all
      .addCase(computeRecommendationsForAll.pending, (state) => {
        state.isComputing = true;
        state.error = null;
      })
      .addCase(computeRecommendationsForAll.fulfilled, (state) => {
        state.isComputing = false;
      })
      .addCase(computeRecommendationsForAll.rejected, (state, action) => {
        state.isComputing = false;
        state.error = action.payload ?? 'Có lỗi xảy ra khi tính toán gợi ý';
      });
  },
});

export const {
  setSelectedCategory,
  clearMyRecommendations,
  clearUserRecommendations,
  clearAllRecommendations,
  clearError,
} = recommendationSlice.actions;

export default recommendationSlice.reducer;
