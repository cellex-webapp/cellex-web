import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { aiService, type AIChatRequest, type AIChatResponse, type AIConversation, type AIMessage } from '@/services/ai.service';
import { store } from '@/stores/store';

type RootState = ReturnType<typeof store.getState>;
type ThunkConfig = { state: RootState; rejectValue: string };

interface AIState {
  conversations: AIConversation[];
  activeConversationId: string | null;
  currentMessages: AIMessage[];
  
  // Pagination
  messagePagination: {
    page: number;
    size: number;
    totalElements: number;
    hasNext: boolean;
  };

  // Loading states
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  
  // Error state
  error: string | null;
  
  // Last AI response (for metadata access)
  lastResponse: AIChatResponse | null;
}

const initialState: AIState = {
  conversations: [],
  activeConversationId: null,
  currentMessages: [],
  messagePagination: {
    page: 0,
    size: 50,
    totalElements: 0,
    hasNext: false,
  },
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  error: null,
  lastResponse: null,
};

// Async thunks
export const fetchAIConversations = createAsyncThunk<any, { page?: number; limit?: number } | undefined, ThunkConfig>(
  'ai/fetchConversations',
  async (params, { rejectWithValue }) => {
    try {
      const response = await aiService.getConversations(params);
      return response.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải danh sách hội thoại');
    }
  }
);

export const fetchAIMessages = createAsyncThunk<any, { conversationId: string; params?: { page?: number; limit?: number } }, ThunkConfig>(
  'ai/fetchMessages',
  async ({ conversationId, params }, { rejectWithValue }) => {
    try {
      const response = await aiService.getMessages(conversationId, params);
      return { conversationId, data: response.result, isLoadMore: params?.page && params.page > 0 };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải tin nhắn');
    }
  }
);

export const sendAIMessage = createAsyncThunk<AIChatResponse, AIChatRequest, ThunkConfig>(
  'ai/sendMessage',
  async (request, { rejectWithValue }) => {
    try {
      const response = await aiService.chat(request);
      return response.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Gửi tin nhắn thất bại');
    }
  }
);

export const createAIConversation = createAsyncThunk<
  { response: AIChatResponse; userMessage: string },
  AIChatRequest,
  ThunkConfig
>(
  'ai/createConversation',
  async (request, { rejectWithValue }) => {
    try {
      const response = await aiService.createConversation(request);
      return { response: response.result, userMessage: request.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Tạo hội thoại thất bại');
    }
  }
);

export const deleteAIConversation = createAsyncThunk<string, string, ThunkConfig>(
  'ai/deleteConversation',
  async (conversationId, { rejectWithValue }) => {
    try {
      await aiService.deleteConversation(conversationId);
      return conversationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Xóa hội thoại thất bại');
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
      if (!action.payload) {
        state.currentMessages = [];
      }
    },
    clearAIChat: (state) => {
      state.activeConversationId = null;
      state.currentMessages = [];
      state.lastResponse = null;
    },
    addUserMessage: (state, action: PayloadAction<{ content: string; conversationId: string }>) => {
      const newMessage: AIMessage = {
        id: `temp-${Date.now()}`,
        userId: '',
        conversationId: action.payload.conversationId,
        messageType: 'USER',
        content: action.payload.content,
        userRole: '',
        createdAt: new Date().toISOString(),
      };
      state.currentMessages.push(newMessage);
    },
  },
  extraReducers: (builder) => {
    // Fetch conversations
    builder
      .addCase(fetchAIConversations.pending, (state) => {
        state.isLoadingConversations = true;
        state.error = null;
      })
      .addCase(fetchAIConversations.fulfilled, (state, action) => {
        state.isLoadingConversations = false;
        state.conversations = action.payload.content || [];
      })
      .addCase(fetchAIConversations.rejected, (state, action) => {
        state.isLoadingConversations = false;
        state.error = action.payload as string;
      });

    // Fetch messages
    builder
      .addCase(fetchAIMessages.pending, (state) => {
        state.isLoadingMessages = true;
        state.error = null;
      })
      .addCase(fetchAIMessages.fulfilled, (state, action) => {
        state.isLoadingMessages = false;
        const { data, isLoadMore } = action.payload;
        
        if (isLoadMore) {
          state.currentMessages = [...(data.content || []).reverse(), ...state.currentMessages];
        } else {
          state.currentMessages = (data.content || []).reverse();
        }
        
        state.messagePagination = {
          page: data.currentPage || 0,
          size: data.pageSize || 50,
          totalElements: data.totalElements || 0,
          hasNext: data.hasNext || false,
        };
      })
      .addCase(fetchAIMessages.rejected, (state, action) => {
        state.isLoadingMessages = false;
        state.error = action.payload as string;
      });

    // Send message
    builder
      .addCase(sendAIMessage.pending, (state) => {
        state.isSendingMessage = true;
        state.error = null;
      })
      .addCase(sendAIMessage.fulfilled, (state, action) => {
        state.isSendingMessage = false;
        state.lastResponse = action.payload;
        
        // Add AI message to current messages
        const aiMessage: AIMessage = {
          id: `ai-${Date.now()}`,
          userId: '',
          conversationId: action.payload.conversationId,
          messageType: 'AI',
          content: action.payload.message,
          userRole: '',
          metadata: action.payload.metadata as any,
          createdAt: action.payload.timestamp,
        };
        state.currentMessages.push(aiMessage);
        
        // Update conversation in list
        const convIndex = state.conversations.findIndex(c => c.id === action.payload.conversationId);
        if (convIndex !== -1) {
          state.conversations[convIndex].lastMessage = action.payload.message.substring(0, 100);
          state.conversations[convIndex].lastMessageAt = action.payload.timestamp;
          state.conversations[convIndex].messageCount += 2;
        }
        
        // Set active conversation if new
        if (!state.activeConversationId) {
          state.activeConversationId = action.payload.conversationId;
        }
      })
      .addCase(sendAIMessage.rejected, (state, action) => {
        state.isSendingMessage = false;
        state.error = action.payload as string;
      });

    // Create conversation
    builder
      .addCase(createAIConversation.pending, (state) => {
        state.isSendingMessage = true;
        state.error = null;
      })
      .addCase(createAIConversation.fulfilled, (state, action) => {
        state.isSendingMessage = false;
        state.lastResponse = action.payload.response;
        state.activeConversationId = action.payload.response.conversationId;
        
        // Add the user message first
        const userMessage: AIMessage = {
          id: `user-${Date.now()}`,
          userId: '',
          conversationId: action.payload.response.conversationId,
          messageType: 'USER',
          content: action.payload.userMessage,
          userRole: '',
          createdAt: new Date().toISOString(),
        };
        
        // Add the AI response message
        const aiMessage: AIMessage = {
          id: `ai-${Date.now()}`,
          userId: '',
          conversationId: action.payload.response.conversationId,
          messageType: 'AI',
          content: action.payload.response.message,
          userRole: '',
          metadata: action.payload.response.metadata as any,
          createdAt: action.payload.response.timestamp,
        };
        state.currentMessages = [userMessage, aiMessage];
      })
      .addCase(createAIConversation.rejected, (state, action) => {
        state.isSendingMessage = false;
        state.error = action.payload as string;
      });

    // Delete conversation
    builder
      .addCase(deleteAIConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(c => c.id !== action.payload);
        if (state.activeConversationId === action.payload) {
          state.activeConversationId = null;
          state.currentMessages = [];
        }
      });
  },
});

export const { setActiveConversation, clearAIChat, addUserMessage } = aiSlice.actions;
export default aiSlice.reducer;
