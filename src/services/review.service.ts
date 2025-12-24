/**
 * Review Service
 * 
 * Service layer for handling all review-related API calls.
 * Integrates with the backend Review APIs for CRUD operations,
 * vendor responses, and helpful votes.
 */

import axiosInstance from "@/utils/axiosInstance";

export const reviewService = {
  /**
   * Get all reviews for a specific product (public endpoint)
   * Only returns APPROVED and APPROVED_BY_ADMIN reviews
   */
  getProductReviews: async (productId: string, params?: IPaginationParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IReview>>>(
      `/reviews/product/${productId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Get review statistics for a product (rating distribution)
   */
  getProductReviewStats: async (productId: string) => {
    const response = await axiosInstance.get<IApiResponse<IReviewStats>>(
      `/reviews/product/${productId}/stats`
    );
    return response.data;
  },

  /**
   * Get a single review by ID
   */
  getReviewById: async (reviewId: string) => {
    const response = await axiosInstance.get<IApiResponse<IReview>>(
      `/reviews/${reviewId}`
    );
    return response.data;
  },

  /**
   * Get all reviews by a specific user
   */
  getUserReviews: async (userId: string, params?: IPaginationParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IReview>>>(
      `/reviews/user/${userId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Get all reviews created by the current authenticated user
   */
  getMyReviews: async (params?: IPaginationParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IReview>>>(
      `/reviews/my-reviews`,
      { params }
    );
    return response.data;
  },

  /**
   * Get all reviews for a shop
   */
  getShopReviews: async (shopId: string, params?: IPaginationParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IReview>>>(
      `/reviews/shop/${shopId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Create a new review for a delivered product
   * Requires CUSTOMER role
   * Sends as multipart/form-data to support image/video uploads
   */
  createReview: async (data: ICreateReviewRequest) => {
    const formData = new FormData();
    formData.append('order_id', data.order_id);
    formData.append('product_id', data.product_id);
    formData.append('rating', String(data.rating));
    
    if (data.comment) {
      formData.append('comment', data.comment);
    }
    
    // Append images as JSON array of URLs
    if (data.images && data.images.length > 0) {
      formData.append('images', JSON.stringify(data.images));
    }
    
    // Append videos as JSON array of URLs
    if (data.videos && data.videos.length > 0) {
      formData.append('videos', JSON.stringify(data.videos));
    }

    const response = await axiosInstance.post<IApiResponse<IReview>>(
      '/reviews',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Update an existing review
   * Requires CUSTOMER role and ownership of the review
   * Review will be re-moderated after update
   */
  updateReview: async (reviewId: string, data: IUpdateReviewRequest) => {
    const formData = new FormData();
    formData.append('rating', String(data.rating));
    
    if (data.comment) {
      formData.append('comment', data.comment);
    }
    
    if (data.images && data.images.length > 0) {
      formData.append('images', JSON.stringify(data.images));
    }
    
    if (data.videos && data.videos.length > 0) {
      formData.append('videos', JSON.stringify(data.videos));
    }

    const response = await axiosInstance.put<IApiResponse<IReview>>(
      `/reviews/${reviewId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Add a vendor response to a review
   * Requires VENDOR role and ownership of the shop
   */
  addVendorResponse: async (reviewId: string, data: IVendorResponseRequest) => {
    console.log('review.service - sending data:', JSON.stringify(data));
    const response = await axiosInstance.post<IApiResponse<IReview>>(
      `/reviews/${reviewId}/vendor-response`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  /**
   * Delete a vendor response from a review
   * Requires VENDOR role and ownership of the response
   */
  deleteVendorResponse: async (reviewId: string) => {
    const response = await axiosInstance.delete<IApiResponse<void>>(
      `/reviews/${reviewId}/vendor-response`
    );
    return response.data;
  },

  /**
   * Mark a review as helpful
   * Each user can only vote once per review
   */
  markReviewHelpful: async (reviewId: string) => {
    const response = await axiosInstance.post<IApiResponse<IReview>>(
      `/reviews/${reviewId}/helpful`
    );
    return response.data;
  },

  /**
   * Get all reviews for a specific order
   * Useful for checking which products in an order have been reviewed
   */
  getOrderReviews: async (orderId: string) => {
    const response = await axiosInstance.get<IApiResponse<IReview[]>>(
      `/reviews/order/${orderId}`
    );
    return response.data;
  },

  /**
   * Delete a review
   * Requires CUSTOMER role and ownership of the review
   * Cascade deletes vendor responses
   */
  deleteReview: async (reviewId: string) => {
    const response = await axiosInstance.delete<IApiResponse<void>>(
      `/reviews/${reviewId}`
    );
    return response.data;
  },

  /**
   * Check if current user has reviewed a specific product in an order
   * Useful for preventing duplicate reviews
   */
  checkUserReviewExists: async (productId: string, orderId: string) => {
    try {
      const response = await axiosInstance.get<IApiResponse<IReview>>(
        `/reviews/check`,
        { params: { productId, orderId } }
      );
      return response.data.result !== null;
    } catch {
      return false;
    }
  },
};

export default reviewService;
