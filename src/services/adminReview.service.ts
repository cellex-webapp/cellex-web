/**
 * Admin Review Service
 * 
 * Service layer for admin review management API calls.
 * Handles all admin endpoints for moderating and managing product reviews.
 * 
 * @see REVIEW_MODERATION_GUIDE.md for API documentation
 */

import axiosInstance from "@/utils/axiosInstance";

/**
 * Admin Review Service
 * All endpoints require ADMIN role authentication
 */
export const adminReviewService = {
  /**
   * Get all reviews with pagination (all statuses)
   * GET /api/v1/admin/reviews
   */
  getAllReviews: async (params?: IAdminReviewParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IAdminReview>>>(
      '/admin/reviews',
      { params: mapParams(params) }
    );
    return response.data;
  },

  /**
   * Get reviews filtered by status
   * GET /api/v1/admin/reviews/status/{status}
   */
  getReviewsByStatus: async (status: ReviewStatus, params?: IAdminReviewParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IAdminReview>>>(
      `/admin/reviews/status/${status}`,
      { params: mapParams(params) }
    );
    return response.data;
  },

  /**
   * Get reviews pending moderation
   * GET /api/v1/admin/reviews/pending
   */
  getPendingReviews: async (params?: IAdminReviewParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IAdminReview>>>(
      '/admin/reviews/pending',
      { params: mapParams(params) }
    );
    return response.data;
  },

  /**
   * Get reviews for a specific product
   * GET /api/v1/admin/reviews/product/{productId}
   */
  getReviewsByProduct: async (productId: string, params?: IAdminReviewParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IAdminReview>>>(
      `/admin/reviews/product/${productId}`,
      { params: mapParams(params) }
    );
    return response.data;
  },

  /**
   * Get reviews for a specific user
   * GET /api/v1/admin/reviews/user/{userId}
   */
  getReviewsByUser: async (userId: string, params?: IAdminReviewParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IAdminReview>>>(
      `/admin/reviews/user/${userId}`,
      { params: mapParams(params) }
    );
    return response.data;
  },

  /**
   * Get reviews within a date range
   * GET /api/v1/admin/reviews/date-range
   */
  getReviewsByDateRange: async (startDate: string, endDate: string, params?: IAdminReviewParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IAdminReview>>>(
      '/admin/reviews/date-range',
      { 
        params: {
          ...mapParams(params),
          startDate,
          endDate
        }
      }
    );
    return response.data;
  },

  /**
   * Get a single review by ID with full details
   * GET /api/v1/admin/reviews/{reviewId}
   */
  getReviewById: async (reviewId: string) => {
    const response = await axiosInstance.get<IApiResponse<IAdminReview>>(
      `/admin/reviews/${reviewId}`
    );
    return response.data;
  },

  /**
   * Approve a review (admin decision)
   * POST /api/v1/admin/reviews/{reviewId}/approve
   */
  approveReview: async (reviewId: string, reason?: string) => {
    const response = await axiosInstance.post<IApiResponse<IAdminReview>>(
      `/admin/reviews/${reviewId}/approve`,
      { reason }
    );
    return response.data;
  },

  /**
   * Reject a review (admin decision)
   * POST /api/v1/admin/reviews/{reviewId}/reject
   */
  rejectReview: async (reviewId: string, reason: string) => {
    const response = await axiosInstance.post<IApiResponse<IAdminReview>>(
      `/admin/reviews/${reviewId}/reject`,
      { reason }
    );
    return response.data;
  },

  /**
   * Hide a review (temporary, can be restored)
   * POST /api/v1/admin/reviews/{reviewId}/hide
   */
  hideReview: async (reviewId: string, reason?: string) => {
    const response = await axiosInstance.post<IApiResponse<IAdminReview>>(
      `/admin/reviews/${reviewId}/hide`,
      { reason }
    );
    return response.data;
  },

  /**
   * Trigger re-moderation via OpenAI
   * POST /api/v1/admin/reviews/{reviewId}/remoderate
   */
  remoderateReview: async (reviewId: string) => {
    const response = await axiosInstance.post<IApiResponse<IAdminReview>>(
      `/admin/reviews/${reviewId}/remoderate`
    );
    return response.data;
  },

  /**
   * Get moderation statistics
   * GET /api/v1/admin/reviews/stats
   */
  getStats: async () => {
    const response = await axiosInstance.get<IApiResponse<IAdminReviewStats>>(
      '/admin/reviews/stats'
    );
    return response.data;
  },
};

/**
 * Map frontend params to backend expected format
 */
function mapParams(params?: IAdminReviewParams): Record<string, any> {
  if (!params) return {};
  
  return {
    page: params.page ?? 0,
    size: params.size ?? 10,
    status: params.status,
    productId: params.productId,
    userId: params.userId,
    productName: params.productName,
    userName: params.userName,
    startDate: params.startDate,
    endDate: params.endDate,
    sortBy: params.sortBy,
    sortDirection: params.sortDirection,
  };
}

export default adminReviewService;
