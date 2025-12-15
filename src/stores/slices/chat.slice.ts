import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { chatService } from '@/services/chat.service';
import { store } from '@/stores/store';

type RootState = ReturnType<typeof store.getState>;
type ThunkConfig = { state: RootState; rejectValue: string };

interface ChatState {
  rooms: IChatRoom[];
  activeRoomId: string | null;
  currentRoomMessages: IMessage[];
  totalUnreadCount: number;
  
  messagePagination: {
    page: number;
    size: number;
    totalElements: number;
    hasNext: boolean;
  };

  isLoadingRooms: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  error: string | null;
}

const initialState: ChatState = {
  rooms: [],
  activeRoomId: null,
  currentRoomMessages: [],
  totalUnreadCount: 0,
  messagePagination: {
    page: 0,
    size: 50,
    totalElements: 0,
    hasNext: false,
  },
  isLoadingRooms: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  error: null,
};

export const fetchChatRooms = createAsyncThunk<any, IChatPaginationParams | undefined, ThunkConfig>(
  'chat/fetchRooms',
  async (params, { rejectWithValue }) => {
    try {
      const response = await chatService.getChatRooms(params);
      return response.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải danh sách chat');
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      if (state.chat.isLoadingRooms) return false;
    },
  }
);

export const fetchMessages = createAsyncThunk<any, { roomId: string; params?: IChatPaginationParams }, ThunkConfig>(
  'chat/fetchMessages',
  async ({ roomId, params }, { rejectWithValue }) => {
    try {
      const response = await chatService.getMessages(roomId, params);
      return { roomId, data: response.result, isLoadMore: params?.page && params.page > 0 };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải tin nhắn');
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      if (state.chat.isLoadingMessages) return false;
    },
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (payload: ISendMessageRequest, { rejectWithValue }) => {
    try {
      const response = await chatService.sendMessage(payload);
      return response.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Gửi tin nhắn thất bại');
    }
  }
);

export const createOrGetRoom = createAsyncThunk(
  'chat/createOrGetRoom',
  async (payload: ICreateChatRoomRequest, { rejectWithValue }) => {
    try {
      const response = await chatService.createOrGetChatRoom(payload);
      return response.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi kết nối phòng chat');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk<any, void, ThunkConfig>(
  'chat/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatService.getUnreadCount();
      const values = Object.values(response.result || {});
      const total = values.reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
      return total;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      if (state.chat.isLoadingRooms) return false;
    },
  }
);

export const markRoomAsRead = createAsyncThunk(
  'chat/markRead',
  async (roomId: string, { rejectWithValue }) => {
    try {
      await chatService.markAsRead(roomId);
      return roomId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveRoom: (state, action: PayloadAction<string | null>) => {
      state.activeRoomId = action.payload;
      if (action.payload === null) {
        state.currentRoomMessages = [];
      }
    },
    receiveRealtimeMessage: (state, action: PayloadAction<IMessage>) => {
      const newMessage = action.payload;
      if (state.activeRoomId === newMessage.chatRoomId) {
        state.currentRoomMessages.unshift(newMessage); 
      }
      const roomIndex = state.rooms.findIndex(r => r.id === newMessage.chatRoomId);
      if (roomIndex !== -1) {
        const room = state.rooms[roomIndex];
        room.lastMessage = newMessage.content;
        room.lastMessageAt = newMessage.createdAt;
        // Unread count will be refreshed via fetchUnreadCount; avoid client-side guesswork here
        state.rooms.splice(roomIndex, 1);
        state.rooms.unshift(room);
      }
    },
    clearChatState: (state) => {
        state.activeRoomId = null;
        state.currentRoomMessages = [];
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchChatRooms.pending, (state) => {
      state.isLoadingRooms = true;
    });
    builder.addCase(fetchChatRooms.fulfilled, (state, action) => {
      state.isLoadingRooms = false;
      state.rooms = action.payload.content;
    });
    builder.addCase(fetchChatRooms.rejected, (state, action) => {
      state.isLoadingRooms = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchMessages.pending, (state) => {
      state.isLoadingMessages = true;
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.isLoadingMessages = false;
      const { data, isLoadMore } = action.payload;
      
      if (isLoadMore) {
        state.currentRoomMessages = [...state.currentRoomMessages, ...data.content];
      } else {
        state.currentRoomMessages = data.content;
      }
      
      state.messagePagination = {
        page: data.currentPage,
        size: data.pageSize,
        totalElements: data.totalElements,
        hasNext: data.hasNext,
      };
    });

    builder.addCase(sendMessage.pending, (state) => {
      state.isSendingMessage = true;
    });
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.isSendingMessage = false;
      state.currentRoomMessages.unshift(action.payload);
      const roomIndex = state.rooms.findIndex(r => r.id === action.payload.chatRoomId);
      if (roomIndex !== -1) {
        state.rooms[roomIndex].lastMessage = action.payload.content;
        state.rooms[roomIndex].lastMessageAt = action.payload.createdAt;
        const room = state.rooms.splice(roomIndex, 1)[0];
        state.rooms.unshift(room);
      }
    });

    builder.addCase(createOrGetRoom.fulfilled, (state, action) => {
      state.activeRoomId = action.payload.id;
      if (!state.rooms.find(r => r.id === action.payload.id)) {
        state.rooms.unshift(action.payload);
      }
    });

    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.totalUnreadCount = action.payload;
    });

    builder.addCase(markRoomAsRead.fulfilled, (state, action) => {
      const roomId = action.payload;
      const room = state.rooms.find(r => r.id === roomId);
      if (room) {
        state.totalUnreadCount = Math.max(0, state.totalUnreadCount - room.unreadCount);
        room.unreadCount = 0;
      }
    });
  },
});

export const { setActiveRoom, receiveRealtimeMessage, clearChatState } = chatSlice.actions;
export default chatSlice.reducer;