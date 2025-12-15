import axiosInstance from '@/utils/axiosInstance';

export const chatService = {
  getChatRooms: async (params?: IChatPaginationParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IChatRoom>>>('/chat/rooms', {
      params,
    });
    return response.data;
  },

  getAllChatRooms: async () => {
    const response = await axiosInstance.get<IApiResponse<IChatRoom[]>>('/chat/rooms/all');
    return response.data;
  },

  createOrGetChatRoom: async (body: ICreateChatRoomRequest) => {
    const response = await axiosInstance.post<IApiResponse<IChatRoom>>('/chat/rooms', body);
    return response.data;
  },

  getMessages: async (roomId: string, params?: IChatPaginationParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IMessage>>>(`/chat/rooms/${roomId}/messages`, {
      params,
    });
    return response.data;
  },

  sendMessage: async (body: ISendMessageRequest) => {
    const response = await axiosInstance.post<IApiResponse<IMessage>>('/chat/messages', body);
    return response.data;
  },

  markAsRead: async (roomId: string) => {
    const response = await axiosInstance.post<IApiResponse<void>>(`/chat/rooms/${roomId}/read`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axiosInstance.get<IApiResponse<Record<string, number>>>('/chat/unread-count');
    return response.data;
  },
};