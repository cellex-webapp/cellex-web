/**
 * useReview Hook
 * 
 * Custom hook for managing review state and operations.
 * Provides a clean interface for components to interact with review data
 * without directly managing API calls or local state.
 */

import { useState, useCallback } from 'react';
import { message } from 'antd';
import { reviewService } from '@/services/review.service';

interface ReviewPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const useReview = () => {
  // State for reviews list
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [stats, setStats] = useState<IReviewStats | null>(null);
  const [userReviews, setUserReviews] = useState<IReview[]>([]);
  
  // Pagination state
  const [pagination, setPagination] = useState<ReviewPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Tracks which reviews the current user has voted helpful
  const [helpfulVotes, setHelpfulVotes] = useState<Set<string>>(new Set());

  /**
   * Fetch reviews for a product with pagination
   */
  const fetchProductReviews = useCallback(async (
    productId: string,
    params?: IPaginationParams
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await reviewService.getProductReviews(productId, params);
      const result = response.result;
      
      setReviews(result.content);
      setPagination({
        page: result.currentPage,
        limit: result.pageSize,
        total: result.totalElements,
        totalPages: result.totalPages,
      });
      
      return result;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Không thể tải đánh giá';
      setError(errorMsg);
      message.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch review statistics for a product
   */
  const fetchProductStats = useCallback(async (productId: string) => {
    setIsLoadingStats(true);
    
    try {
      const response = await reviewService.getProductReviewStats(productId);
      setStats(response.result);
      return response.result;
    } catch (err: any) {
      console.error('Failed to fetch review stats:', err);
      // Don't show error message for stats - it's not critical
      return null;
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  /**
   * Fetch reviews for a shop
   */
  const fetchShopReviews = useCallback(async (
    shopId: string,
    params?: IPaginationParams
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await reviewService.getShopReviews(shopId, params);
      const result = response.result;
      
      setReviews(result.content);
      setPagination({
        page: result.currentPage,
        limit: result.pageSize,
        total: result.totalElements,
        totalPages: result.totalPages,
      });
      
      return result;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Không thể tải đánh giá';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch current user's reviews
   */
  const fetchMyReviews = useCallback(async (params?: IPaginationParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await reviewService.getMyReviews(params);
      const result = response.result;
      
      setUserReviews(result.content);
      setPagination({
        page: result.currentPage,
        limit: result.pageSize,
        total: result.totalElements,
        totalPages: result.totalPages,
      });
      
      return result;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Không thể tải đánh giá của bạn';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new review
   */
  const createReview = useCallback(async (data: ICreateReviewRequest) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await reviewService.createReview(data);
      const newReview = response.result;
      
      // Show appropriate message based on review status
      if (newReview.status === 'PENDING_MODERATION') {
        message.info('Đánh giá của bạn đang được kiểm duyệt. Chúng tôi sẽ thông báo khi hoàn tất.');
      } else if (newReview.status === 'APPROVED') {
        message.success('Cảm ơn bạn đã đánh giá!');
      } else if (newReview.status === 'REJECTED_AUTO') {
        message.warning('Đánh giá không được chấp nhận. Vui lòng kiểm tra nội dung và thử lại.');
      }
      
      return newReview;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Không thể tạo đánh giá';
      setError(errorMsg);
      message.error(errorMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  /**
   * Update an existing review
   */
  const updateReview = useCallback(async (
    reviewId: string,
    data: IUpdateReviewRequest
  ) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await reviewService.updateReview(reviewId, data);
      const updatedReview = response.result;
      
      // Update local state
      setReviews(prev => prev.map(r => r.id === reviewId ? updatedReview : r));
      setUserReviews(prev => prev.map(r => r.id === reviewId ? updatedReview : r));
      
      message.success('Cập nhật đánh giá thành công. Đánh giá sẽ được kiểm duyệt lại.');
      
      return updatedReview;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Không thể cập nhật đánh giá';
      setError(errorMsg);
      message.error(errorMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  /**
   * Add vendor response to a review
   */
  const addVendorResponse = useCallback(async (
    reviewId: string,
    comment: string
  ) => {
    setIsSubmitting(true);
    setError(null);
    
    // Validate comment before sending to API
    const trimmedComment = comment?.trim();
    if (!trimmedComment || trimmedComment.length < 10) {
      const errorMsg = !trimmedComment 
        ? 'Nội dung phản hồi không được để trống' 
        : 'Nội dung phản hồi phải có ít nhất 10 ký tự';
      setError(errorMsg);
      message.error(errorMsg);
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await reviewService.addVendorResponse(reviewId, { comment: trimmedComment });
      const updatedReview = response.result;
      
      // Update local state
      setReviews(prev => prev.map(r => r.id === reviewId ? updatedReview : r));
      
      message.success('Đã thêm phản hồi thành công');
      
      return updatedReview;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Không thể thêm phản hồi';
      setError(errorMsg);
      message.error(errorMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  /**
   * Delete vendor response from a review
   */
  const deleteVendorResponse = useCallback(async (reviewId: string) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await reviewService.deleteVendorResponse(reviewId);
      
      // Update local state - remove vendor_response from the review
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, vendor_response: undefined } : r
      ));
      
      message.success('Đã xóa phản hồi');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Không thể xóa phản hồi';
      setError(errorMsg);
      message.error(errorMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  /**
   * Mark a review as helpful (optimistic update)
   */
  const markHelpful = useCallback(async (reviewId: string) => {
    // Check if already voted
    if (helpfulVotes.has(reviewId)) {
      message.info('Bạn đã đánh giá hữu ích rồi');
      return;
    }

    // Optimistic update
    setHelpfulVotes(prev => new Set([...prev, reviewId]));
    setReviews(prev => prev.map(r => 
      r.id === reviewId 
        ? { ...r, helpful_count: (r.helpful_count || 0) + 1, has_voted_helpful: true }
        : r
    ));

    try {
      await reviewService.markReviewHelpful(reviewId);
      message.success('Cảm ơn bạn đã đánh giá!');
    } catch (err: any) {
      // Rollback on error
      setHelpfulVotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
      setReviews(prev => prev.map(r => 
        r.id === reviewId 
          ? { ...r, helpful_count: Math.max((r.helpful_count || 1) - 1, 0), has_voted_helpful: false }
          : r
      ));
      
      const errorMsg = err?.response?.data?.message || 'Không thể đánh giá hữu ích';
      message.error(errorMsg);
    }
  }, [helpfulVotes]);

  /**
   * Change page for pagination
   */
  const changePage = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setReviews([]);
    setStats(null);
    setUserReviews([]);
    setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
    setError(null);
    setHelpfulVotes(new Set());
  }, []);

  return {
    // State
    reviews,
    stats,
    userReviews,
    pagination,
    isLoading,
    isLoadingStats,
    isSubmitting,
    error,
    helpfulVotes,

    // Actions
    fetchProductReviews,
    fetchProductStats,
    fetchShopReviews,
    fetchMyReviews,
    createReview,
    updateReview,
    addVendorResponse,
    deleteVendorResponse,
    markHelpful,
    changePage,
    reset,
  };
};

export default useReview;
