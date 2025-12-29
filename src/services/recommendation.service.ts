/**
 * Recommendation Service
 * Handles all API calls for product recommendation system
 */
import axiosInstance from "@/utils/axiosInstance";

export interface IRecommendationResponse {
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  final_price: number;
  average_rating: number;
  review_count: number;
  recommendation_score: number;
  recommendation_reason: RecommendationReason;
  explanation: string;
  rank: number;
}

export type RecommendationReason = 
  | 'CF' 
  | 'TRENDING' 
  | 'CONTENT_BASED' 
  | 'POPULARITY' 
  | 'POPULAR_IN_CATEGORY';

export interface IRecommendationParams {
  categoryId?: string;
  limit?: number;
}

export interface IComputeResponse {
  message: string;
  userId?: string;
  recommendationsCount?: number;
}

export const recommendationService = {
  /**
   * Get recommendations for current authenticated user
   */
  getMyRecommendations: async (params?: IRecommendationParams) => {
    const response = await axiosInstance.get<IApiResponse<IRecommendationResponse[]>>(
      '/recommendations/me', 
      { params }
    );
    return response.data;
  },

  /**
   * Get recommendations for a specific user (Admin)
   */
  getUserRecommendations: async (userId: string, params?: IRecommendationParams) => {
    const response = await axiosInstance.get<IApiResponse<IRecommendationResponse[]>>(
      `/recommendations/user/${userId}`, 
      { params }
    );
    return response.data;
  },

  /**
   * Get precomputed recommendations for a user (faster)
   */
  getPrecomputedRecommendations: async (userId: string, limit?: number) => {
    const response = await axiosInstance.get<IApiResponse<IRecommendationResponse[]>>(
      `/recommendations/precomputed/${userId}`,
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * Trigger recommendation computation for a specific user (Admin)
   */
  computeForUser: async (userId: string) => {
    const response = await axiosInstance.post<IApiResponse<IComputeResponse>>(
      `/recommendations/compute/${userId}`
    );
    return response.data;
  },

  /**
   * Trigger recommendation computation for all users (Admin)
   */
  computeForAll: async () => {
    const response = await axiosInstance.post<IApiResponse<IComputeResponse>>(
      '/recommendations/compute-all'
    );
    return response.data;
  },
};

export default recommendationService;
