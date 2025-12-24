/**
 * useVendorReview Hook
 * 
 * Custom hook for managing vendor review operations.
 * Provides functionality for viewing shop reviews and managing vendor responses.
 */

import { useState, useCallback } from 'react';
import { message } from 'antd';
import { reviewService } from '@/services/review.service';

interface VendorReviewPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface VendorReviewFilters {
  rating?: number;
  search?: string;
}

export const useVendorReview = () => {
  // State for reviews list
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<IReview | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState<VendorReviewPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filter state
  const [filters, setFilters] = useState<VendorReviewFilters>({});

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [isDeletingResponse, setIsDeletingResponse] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    withResponse: 0,
    withoutResponse: 0,
    ratingDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  });

  /**
   * Fetch reviews for the vendor's shop
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

      // Calculate stats from reviews
      const totalReviews = result.totalElements;
      const withResponse = result.content.filter((r: IReview) => r.vendor_response).length;
      const totalRating = result.content.reduce((sum: number, r: IReview) => sum + r.rating, 0);
      const avgRating = result.content.length > 0 ? totalRating / result.content.length : 0;

      // Rating distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      result.content.forEach((r: IReview) => {
        if (r.rating >= 1 && r.rating <= 5) {
          distribution[r.rating as keyof typeof distribution]++;
        }
      });

      setStats({
        totalReviews,
        averageRating: Math.round(avgRating * 10) / 10,
        withResponse,
        withoutResponse: result.content.length - withResponse,
        ratingDistribution: distribution,
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
   * Add vendor response to a review
   */
  const addVendorResponse = useCallback(async (reviewId: string, comment: string) => {
    setIsSubmittingResponse(true);
    setError(null);
    
    // Validate comment before sending to API
    const trimmedComment = comment?.trim();
    
    console.log('addVendorResponse called:', { reviewId, comment, trimmedComment });
    
    if (!trimmedComment || trimmedComment.length < 10) {
      const errorMsg = !trimmedComment 
        ? 'Nội dung phản hồi không được để trống' 
        : 'Nội dung phản hồi phải có ít nhất 10 ký tự';
      setError(errorMsg);
      message.error(errorMsg);
      setIsSubmittingResponse(false);
      return;
    }
    
    try {
      console.log('Sending to API:', { reviewId, data: { comment: trimmedComment } });
      const response = await reviewService.addVendorResponse(reviewId, { comment: trimmedComment });
      const updatedReview = response.result;
      
      // Update the review in the list
      setReviews(prev => 
        prev.map(r => r.id === reviewId ? updatedReview : r)
      );
      
      // Update selected review if it's the one being responded to
      if (selectedReview?.id === reviewId) {
        setSelectedReview(updatedReview);
      }
      
      message.success('Đã gửi phản hồi thành công!');
      return updatedReview;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Không thể gửi phản hồi';
      setError(errorMsg);
      message.error(errorMsg);
      throw err;
    } finally {
      setIsSubmittingResponse(false);
    }
  }, [selectedReview]);

  /**
   * Delete vendor response from a review
   */
  const deleteVendorResponse = useCallback(async (reviewId: string) => {
    setIsDeletingResponse(true);
    setError(null);
    
    try {
      await reviewService.deleteVendorResponse(reviewId);
      
      // Update the review in the list (remove vendor_response)
      setReviews(prev => 
        prev.map(r => r.id === reviewId ? { ...r, vendor_response: undefined } : r)
      );
      
      // Update selected review if it's the one being modified
      if (selectedReview?.id === reviewId) {
        setSelectedReview({ ...selectedReview, vendor_response: undefined });
      }
      
      message.success('Đã xóa phản hồi');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Không thể xóa phản hồi';
      setError(errorMsg);
      message.error(errorMsg);
      throw err;
    } finally {
      setIsDeletingResponse(false);
    }
  }, [selectedReview]);

  /**
   * Filter reviews locally
   */
  const getFilteredReviews = useCallback(() => {
    let filtered = [...reviews];

    // Filter by rating
    if (filters.rating) {
      filtered = filtered.filter(r => r.rating === filters.rating);
    }

    // Filter by search term (in comment or user name)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.comment?.toLowerCase().includes(searchLower) ||
        r.user_name.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [reviews, filters]);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters: Partial<VendorReviewFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  /**
   * Select a review for detailed view
   */
  const selectReview = useCallback((review: IReview | null) => {
    setSelectedReview(review);
  }, []);

  return {
    // Data
    reviews,
    selectedReview,
    pagination,
    filters,
    stats,
    
    // Loading states
    isLoading,
    isSubmittingResponse,
    isDeletingResponse,
    
    // Error
    error,
    
    // Methods
    fetchShopReviews,
    addVendorResponse,
    deleteVendorResponse,
    getFilteredReviews,
    updateFilters,
    clearFilters,
    selectReview,
    setPagination,
  };
};

export default useVendorReview;
