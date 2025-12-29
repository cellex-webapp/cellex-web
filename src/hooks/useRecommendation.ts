/**
 * useRecommendation Hook
 * Custom hook for managing product recommendations
 * Wraps Redux actions and provides convenient methods
 */
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  fetchMyRecommendations,
  fetchUserRecommendations,
  fetchPrecomputedRecommendations,
  computeRecommendationsForUser,
  computeRecommendationsForAll,
  setSelectedCategory,
  clearMyRecommendations,
  clearUserRecommendations,
  clearAllRecommendations,
  clearError,
} from '@/stores/slices/recommendation.slice';
import {
  selectMyRecommendations,
  selectUserRecommendations,
  selectRecommendationIsLoading,
  selectRecommendationIsComputing,
  selectRecommendationError,
  selectRecommendationLastFetched,
  selectSelectedCategory,
  selectShouldRefreshRecommendations,
  selectMyRecommendationsByReason,
  selectMyRecommendationsCount,
} from '@/stores/selectors/recommendation.selector';
import { selectIsAuthenticated } from '@/stores/selectors/auth.selector';
import type { IRecommendationParams } from '@/services/recommendation.service';

export const useRecommendation = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const myRecommendations = useAppSelector(selectMyRecommendations);
  const isLoading = useAppSelector(selectRecommendationIsLoading);
  const isComputing = useAppSelector(selectRecommendationIsComputing);
  const error = useAppSelector(selectRecommendationError);
  const lastFetched = useAppSelector(selectRecommendationLastFetched);
  const selectedCategory = useAppSelector(selectSelectedCategory);
  const shouldRefresh = useAppSelector(selectShouldRefreshRecommendations);
  const recommendationsByReason = useAppSelector(selectMyRecommendationsByReason);
  const recommendationsCount = useAppSelector(selectMyRecommendationsCount);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Actions
  const handleFetchMyRecommendations = useCallback(
    (params?: IRecommendationParams) => dispatch(fetchMyRecommendations(params)),
    [dispatch]
  );

  const handleFetchUserRecommendations = useCallback(
    (userId: string, params?: IRecommendationParams) =>
      dispatch(fetchUserRecommendations({ userId, params })),
    [dispatch]
  );

  const handleFetchPrecomputed = useCallback(
    (userId: string, limit?: number) =>
      dispatch(fetchPrecomputedRecommendations({ userId, limit })),
    [dispatch]
  );

  const handleComputeForUser = useCallback(
    (userId: string) => dispatch(computeRecommendationsForUser(userId)),
    [dispatch]
  );

  const handleComputeForAll = useCallback(
    () => dispatch(computeRecommendationsForAll()),
    [dispatch]
  );

  const handleSetCategory = useCallback(
    (categoryId: string | null) => dispatch(setSelectedCategory(categoryId)),
    [dispatch]
  );

  const handleClearMy = useCallback(
    () => dispatch(clearMyRecommendations()),
    [dispatch]
  );

  const handleClearUser = useCallback(
    (userId: string) => dispatch(clearUserRecommendations(userId)),
    [dispatch]
  );

  const handleClearAll = useCallback(
    () => dispatch(clearAllRecommendations()),
    [dispatch]
  );

  const handleClearError = useCallback(
    () => dispatch(clearError()),
    [dispatch]
  );

  // Get recommendations for specific user (memoized selector factory)
  const getUserRecommendations = useCallback(
    (userId: string) => selectUserRecommendations(userId),
    []
  );

  // Refresh recommendations if needed
  const refreshIfNeeded = useCallback(
    (params?: IRecommendationParams) => {
      if (isAuthenticated && shouldRefresh && !isLoading) {
        handleFetchMyRecommendations(params);
      }
    },
    [isAuthenticated, shouldRefresh, isLoading, handleFetchMyRecommendations]
  );

  return {
    // State
    myRecommendations,
    isLoading,
    isComputing,
    error,
    lastFetched,
    selectedCategory,
    shouldRefresh,
    recommendationsByReason,
    recommendationsCount,
    isAuthenticated,

    // Actions
    fetchMyRecommendations: handleFetchMyRecommendations,
    fetchUserRecommendations: handleFetchUserRecommendations,
    fetchPrecomputedRecommendations: handleFetchPrecomputed,
    computeForUser: handleComputeForUser,
    computeForAll: handleComputeForAll,
    setSelectedCategory: handleSetCategory,
    clearMyRecommendations: handleClearMy,
    clearUserRecommendations: handleClearUser,
    clearAllRecommendations: handleClearAll,
    clearError: handleClearError,
    getUserRecommendationsSelector: getUserRecommendations,
    refreshIfNeeded,
  };
};

/**
 * Hook specifically for fetching recommendations on mount
 * Auto-fetches recommendations if authenticated and needed
 */
export const useAutoFetchRecommendations = (
  params?: IRecommendationParams,
  enabled: boolean = true
) => {
  const {
    myRecommendations,
    isLoading,
    error,
    isAuthenticated,
    shouldRefresh,
    fetchMyRecommendations,
  } = useRecommendation();

  useEffect(() => {
    if (enabled && isAuthenticated && shouldRefresh && !isLoading) {
      fetchMyRecommendations(params);
    }
  }, [enabled, isAuthenticated, shouldRefresh, isLoading, fetchMyRecommendations, params]);

  return {
    recommendations: myRecommendations,
    isLoading,
    error,
  };
};
