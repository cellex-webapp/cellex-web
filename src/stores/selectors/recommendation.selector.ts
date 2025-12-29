/**
 * Recommendation Selectors
 * Memoized selectors for recommendation state
 */
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/stores/store';
import type { IRecommendationResponse, RecommendationReason } from '@/services/recommendation.service';

const selectRecommendationState = (state: RootState) => state.recommendation;

/**
 * Select all recommendations for current user
 */
export const selectMyRecommendations = createSelector(
  [selectRecommendationState],
  (state) => state.myRecommendations
);

/**
 * Select recommendations for a specific user by ID
 */
export const selectUserRecommendations = (userId: string) =>
  createSelector(
    [selectRecommendationState],
    (state) => state.userRecommendations[userId] ?? []
  );

/**
 * Select all user recommendations map
 */
export const selectAllUserRecommendations = createSelector(
  [selectRecommendationState],
  (state) => state.userRecommendations
);

/**
 * Select loading state
 */
export const selectRecommendationIsLoading = createSelector(
  [selectRecommendationState],
  (state) => state.isLoading
);

/**
 * Select computing state (for admin operations)
 */
export const selectRecommendationIsComputing = createSelector(
  [selectRecommendationState],
  (state) => state.isComputing
);

/**
 * Select error state
 */
export const selectRecommendationError = createSelector(
  [selectRecommendationState],
  (state) => state.error
);

/**
 * Select last fetched timestamp
 */
export const selectRecommendationLastFetched = createSelector(
  [selectRecommendationState],
  (state) => state.lastFetched
);

/**
 * Select selected category filter
 */
export const selectSelectedCategory = createSelector(
  [selectRecommendationState],
  (state) => state.selectedCategory
);

/**
 * Select my recommendations filtered by category
 */
export const selectMyRecommendationsByCategory = createSelector(
  [selectMyRecommendations, selectSelectedCategory],
  (recommendations, categoryId): IRecommendationResponse[] => {
    if (!categoryId) return recommendations;
    // If backend supports category filtering, this is already filtered
    // This is a fallback for client-side filtering if needed
    return recommendations;
  }
);

/**
 * Select my recommendations grouped by reason
 */
export const selectMyRecommendationsByReason = createSelector(
  [selectMyRecommendations],
  (recommendations): Record<RecommendationReason, IRecommendationResponse[]> => {
    const grouped: Record<RecommendationReason, IRecommendationResponse[]> = {
      CF: [],
      TRENDING: [],
      CONTENT_BASED: [],
      POPULARITY: [],
      POPULAR_IN_CATEGORY: [],
    };

    recommendations.forEach((rec) => {
      if (grouped[rec.recommendation_reason]) {
        grouped[rec.recommendation_reason].push(rec);
      }
    });

    return grouped;
  }
);

/**
 * Select total count of my recommendations
 */
export const selectMyRecommendationsCount = createSelector(
  [selectMyRecommendations],
  (recommendations) => recommendations.length
);

/**
 * Check if recommendations should be refreshed (older than 5 minutes)
 */
export const selectShouldRefreshRecommendations = createSelector(
  [selectRecommendationLastFetched],
  (lastFetched): boolean => {
    if (!lastFetched) return true;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(lastFetched) < fiveMinutesAgo;
  }
);
