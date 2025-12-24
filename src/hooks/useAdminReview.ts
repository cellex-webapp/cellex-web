/**
 * Admin Review Hook
 * 
 * Custom React hook for admin review management.
 * Provides state management and API integration for review moderation.
 */

import { useState, useCallback, useMemo } from 'react';
import { message } from 'antd';
import { adminReviewService } from '@/services/adminReview.service';

interface UseAdminReviewState {
  reviews: IAdminReview[];
  selectedReview: IAdminReview | null;
  stats: IAdminReviewStats | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  isStatsLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
}

const initialPagination = {
  current: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
};

/**
 * Custom hook for admin review management
 */
export function useAdminReview() {
  const [state, setState] = useState<UseAdminReviewState>({
    reviews: [],
    selectedReview: null,
    stats: null,
    pagination: initialPagination,
    isLoading: false,
    isStatsLoading: false,
    isActionLoading: false,
    error: null,
  });

  /**
   * Fetch all reviews with optional filters
   */
  const fetchReviews = useCallback(async (params?: IAdminReviewParams) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await adminReviewService.getAllReviews({
        ...params,
        page: (params?.page ?? 1) - 1, // Backend uses 0-indexed pages
      });
      
      if (response.code === 2000) {
        setState(prev => ({
          ...prev,
          reviews: response.result.content,
          pagination: {
            current: response.result.currentPage + 1,
            pageSize: response.result.pageSize,
            total: response.result.totalElements,
            totalPages: response.result.totalPages,
          },
          isLoading: false,
        }));
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Lỗi khi tải danh sách đánh giá';
      setState(prev => ({ ...prev, isLoading: false, error: errorMsg }));
      message.error(errorMsg);
    }
  }, []);

  /**
   * Fetch reviews by status
   */
  const fetchReviewsByStatus = useCallback(async (status: ReviewStatus, params?: IAdminReviewParams) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await adminReviewService.getReviewsByStatus(status, {
        ...params,
        page: (params?.page ?? 1) - 1,
      });
      
      if (response.code === 2000) {
        setState(prev => ({
          ...prev,
          reviews: response.result.content,
          pagination: {
            current: response.result.currentPage + 1,
            pageSize: response.result.pageSize,
            total: response.result.totalElements,
            totalPages: response.result.totalPages,
          },
          isLoading: false,
        }));
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Lỗi khi tải đánh giá theo trạng thái';
      setState(prev => ({ ...prev, isLoading: false, error: errorMsg }));
      message.error(errorMsg);
    }
  }, []);

  /**
   * Fetch pending reviews
   */
  const fetchPendingReviews = useCallback(async (params?: IAdminReviewParams) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await adminReviewService.getPendingReviews({
        ...params,
        page: (params?.page ?? 1) - 1,
      });
      
      if (response.code === 2000) {
        setState(prev => ({
          ...prev,
          reviews: response.result.content,
          pagination: {
            current: response.result.currentPage + 1,
            pageSize: response.result.pageSize,
            total: response.result.totalElements,
            totalPages: response.result.totalPages,
          },
          isLoading: false,
        }));
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Lỗi khi tải đánh giá chờ kiểm duyệt';
      setState(prev => ({ ...prev, isLoading: false, error: errorMsg }));
      message.error(errorMsg);
    }
  }, []);

  /**
   * Fetch reviews by product ID
   */
  const fetchReviewsByProduct = useCallback(async (productId: string, params?: IAdminReviewParams) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await adminReviewService.getReviewsByProduct(productId, {
        ...params,
        page: (params?.page ?? 1) - 1,
      });
      
      if (response.code === 2000) {
        setState(prev => ({
          ...prev,
          reviews: response.result.content,
          pagination: {
            current: response.result.currentPage + 1,
            pageSize: response.result.pageSize,
            total: response.result.totalElements,
            totalPages: response.result.totalPages,
          },
          isLoading: false,
        }));
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Lỗi khi tải đánh giá theo sản phẩm';
      setState(prev => ({ ...prev, isLoading: false, error: errorMsg }));
      message.error(errorMsg);
    }
  }, []);

  /**
   * Fetch reviews by user ID
   */
  const fetchReviewsByUser = useCallback(async (userId: string, params?: IAdminReviewParams) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await adminReviewService.getReviewsByUser(userId, {
        ...params,
        page: (params?.page ?? 1) - 1,
      });
      
      if (response.code === 2000) {
        setState(prev => ({
          ...prev,
          reviews: response.result.content,
          pagination: {
            current: response.result.currentPage + 1,
            pageSize: response.result.pageSize,
            total: response.result.totalElements,
            totalPages: response.result.totalPages,
          },
          isLoading: false,
        }));
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Lỗi khi tải đánh giá theo người dùng';
      setState(prev => ({ ...prev, isLoading: false, error: errorMsg }));
      message.error(errorMsg);
    }
  }, []);

  /**
   * Fetch reviews by date range
   */
  const fetchReviewsByDateRange = useCallback(async (
    startDate: string, 
    endDate: string, 
    params?: IAdminReviewParams
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await adminReviewService.getReviewsByDateRange(startDate, endDate, {
        ...params,
        page: (params?.page ?? 1) - 1,
      });
      
      if (response.code === 2000) {
        setState(prev => ({
          ...prev,
          reviews: response.result.content,
          pagination: {
            current: response.result.currentPage + 1,
            pageSize: response.result.pageSize,
            total: response.result.totalElements,
            totalPages: response.result.totalPages,
          },
          isLoading: false,
        }));
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Lỗi khi tải đánh giá theo khoảng thời gian';
      setState(prev => ({ ...prev, isLoading: false, error: errorMsg }));
      message.error(errorMsg);
    }
  }, []);

  /**
   * Fetch single review details
   */
  const fetchReviewById = useCallback(async (reviewId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await adminReviewService.getReviewById(reviewId);
      
      if (response.code === 2000) {
        setState(prev => ({
          ...prev,
          selectedReview: response.result,
          isLoading: false,
        }));
        return response.result;
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Lỗi khi tải chi tiết đánh giá';
      setState(prev => ({ ...prev, isLoading: false, error: errorMsg }));
      message.error(errorMsg);
    }
    return null;
  }, []);

  /**
   * Fetch moderation statistics
   */
  const fetchStats = useCallback(async () => {
    setState(prev => ({ ...prev, isStatsLoading: true }));
    
    try {
      const response = await adminReviewService.getStats();
      
      if (response.code === 2000) {
        setState(prev => ({
          ...prev,
          stats: response.result,
          isStatsLoading: false,
        }));
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Lỗi khi tải thống kê';
      setState(prev => ({ ...prev, isStatsLoading: false }));
      message.error(errorMsg);
    }
  }, []);

  /**
   * Approve a review
   */
  const approveReview = useCallback(async (reviewId: string, reason?: string) => {
    setState(prev => ({ ...prev, isActionLoading: true }));
    
    try {
      const response = await adminReviewService.approveReview(reviewId, reason);
      
      if (response.code === 2000) {
        message.success('Đã duyệt đánh giá thành công');
        // Update local state
        setState(prev => ({
          ...prev,
          reviews: prev.reviews.map(r => 
            r.id === reviewId ? { ...r, ...response.result } : r
          ),
          selectedReview: prev.selectedReview?.id === reviewId 
            ? { ...prev.selectedReview, ...response.result }
            : prev.selectedReview,
          isActionLoading: false,
        }));
        return true;
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Lỗi khi duyệt đánh giá';
      setState(prev => ({ ...prev, isActionLoading: false }));
      message.error(errorMsg);
    }
    return false;
  }, []);

  /**
   * Reject a review
   */
  const rejectReview = useCallback(async (reviewId: string, reason: string) => {
    setState(prev => ({ ...prev, isActionLoading: true }));
    
    try {
      const response = await adminReviewService.rejectReview(reviewId, reason);
      
      if (response.code === 2000) {
        message.success('Đã từ chối đánh giá');
        // Update local state
        setState(prev => ({
          ...prev,
          reviews: prev.reviews.map(r => 
            r.id === reviewId ? { ...r, ...response.result } : r
          ),
          selectedReview: prev.selectedReview?.id === reviewId 
            ? { ...prev.selectedReview, ...response.result }
            : prev.selectedReview,
          isActionLoading: false,
        }));
        return true;
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Lỗi khi từ chối đánh giá';
      setState(prev => ({ ...prev, isActionLoading: false }));
      message.error(errorMsg);
    }
    return false;
  }, []);

  /**
   * Hide a review
   */
  const hideReview = useCallback(async (reviewId: string, reason?: string) => {
    setState(prev => ({ ...prev, isActionLoading: true }));
    
    try {
      const response = await adminReviewService.hideReview(reviewId, reason);
      
      if (response.code === 2000) {
        message.success('Đã ẩn đánh giá');
        // Update local state
        setState(prev => ({
          ...prev,
          reviews: prev.reviews.map(r => 
            r.id === reviewId ? { ...r, ...response.result } : r
          ),
          selectedReview: prev.selectedReview?.id === reviewId 
            ? { ...prev.selectedReview, ...response.result }
            : prev.selectedReview,
          isActionLoading: false,
        }));
        return true;
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Lỗi khi ẩn đánh giá';
      setState(prev => ({ ...prev, isActionLoading: false }));
      message.error(errorMsg);
    }
    return false;
  }, []);

  /**
   * Remoderate a review
   */
  const remoderateReview = useCallback(async (reviewId: string) => {
    setState(prev => ({ ...prev, isActionLoading: true }));
    
    try {
      const response = await adminReviewService.remoderateReview(reviewId);
      
      if (response.code === 2000) {
        message.success('Đã gửi yêu cầu kiểm duyệt lại');
        // Update local state
        setState(prev => ({
          ...prev,
          reviews: prev.reviews.map(r => 
            r.id === reviewId ? { ...r, ...response.result } : r
          ),
          selectedReview: prev.selectedReview?.id === reviewId 
            ? { ...prev.selectedReview, ...response.result }
            : prev.selectedReview,
          isActionLoading: false,
        }));
        return true;
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Lỗi khi kiểm duyệt lại';
      setState(prev => ({ ...prev, isActionLoading: false }));
      message.error(errorMsg);
    }
    return false;
  }, []);

  /**
   * Set selected review
   */
  const setSelectedReview = useCallback((review: IAdminReview | null) => {
    setState(prev => ({ ...prev, selectedReview: review }));
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Memoized return values
  return useMemo(() => ({
    // State
    reviews: state.reviews,
    selectedReview: state.selectedReview,
    stats: state.stats,
    pagination: state.pagination,
    isLoading: state.isLoading,
    isStatsLoading: state.isStatsLoading,
    isActionLoading: state.isActionLoading,
    error: state.error,
    
    // Fetch actions
    fetchReviews,
    fetchReviewsByStatus,
    fetchPendingReviews,
    fetchReviewsByProduct,
    fetchReviewsByUser,
    fetchReviewsByDateRange,
    fetchReviewById,
    fetchStats,
    
    // Moderation actions
    approveReview,
    rejectReview,
    hideReview,
    remoderateReview,
    
    // Utilities
    setSelectedReview,
    clearError,
  }), [
    state,
    fetchReviews,
    fetchReviewsByStatus,
    fetchPendingReviews,
    fetchReviewsByProduct,
    fetchReviewsByUser,
    fetchReviewsByDateRange,
    fetchReviewById,
    fetchStats,
    approveReview,
    rejectReview,
    hideReview,
    remoderateReview,
    setSelectedReview,
    clearError,
  ]);
}

export default useAdminReview;
