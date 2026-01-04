import axiosInstance from '@/utils/axiosInstance';

export interface AIChatRequest {
  message: string;
  conversationId?: string;
  shopId?: string;
}

export interface AIMetadata {
  productIds?: string[];
  chartData?: ChartData;
  tableData?: Record<string, any>[];
  couponSuggestions?: CouponSuggestion[];
  functionCalled?: string;
}

export interface ChartData {
  chartType: 'LINE' | 'BAR' | 'PIE';
  title: string;
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
}

export interface CouponSuggestion {
  productId: string;
  productName: string;
  viewCount: number;
  purchaseCount: number;
  suggestedDiscount: number;
  reason: string;
}

export interface AIChatResponse {
  message: string;
  conversationId: string;
  messageId: string;
  metadata?: AIMetadata;
  responseType: 'TEXT' | 'PRODUCT_LIST' | 'CHART' | 'TABLE' | 'COUPON' | 'MIXED';
  timestamp: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  userRole: string;
  shopId?: string;
  messageCount: number;
  lastMessage?: string;
  lastMessageAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AIMessage {
  id: string;
  userId: string;
  conversationId: string;
  messageType: 'USER' | 'AI' | 'SYSTEM';
  content: string;
  userRole: string;
  shopId?: string;
  metadata?: Record<string, any>;
  functionCalled?: string;
  createdAt: string;
}

export const aiService = {
  /**
   * Gửi tin nhắn cho AI
   */
  chat: async (request: AIChatRequest) => {
    const response = await axiosInstance.post<IApiResponse<AIChatResponse>>('/ai/chat', request);
    return response.data;
  },

  /**
   * Lấy danh sách conversations
   */
  getConversations: async (params?: { page?: number; limit?: number }) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<AIConversation>>>('/ai/conversations', {
      params,
    });
    return response.data;
  },

  /**
   * Lấy tin nhắn của một conversation
   */
  getMessages: async (conversationId: string, params?: { page?: number; limit?: number }) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<AIMessage>>>(
      `/ai/conversations/${conversationId}/messages`,
      { params }
    );
    return response.data;
  },

  /**
   * Xóa conversation
   */
  deleteConversation: async (conversationId: string) => {
    const response = await axiosInstance.delete<IApiResponse<void>>(`/ai/conversations/${conversationId}`);
    return response.data;
  },

  /**
   * Tạo conversation mới
   */
  createConversation: async (request: AIChatRequest) => {
    const response = await axiosInstance.post<IApiResponse<AIChatResponse>>('/ai/conversations', request);
    return response.data;
  },
};
