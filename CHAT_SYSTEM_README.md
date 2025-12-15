# 💬 Hệ Thống Chat Realtime - Cellex

## 📋 Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
3. [Business Rules](#business-rules)
4. [API Reference](#api-reference)
5. [WebSocket Events](#websocket-events)
6. [Hướng Dẫn Implement Frontend (React + Tailwind CSS)](#hướng-dẫn-implement-frontend)
7. [Error Codes](#error-codes)
8. [Best Practices](#best-practices)

---

## 🎯 Tổng Quan

Hệ thống Chat Realtime của Cellex cho phép giao tiếp trực tiếp giữa các người dùng trong hệ thống với các tính năng:

- ✅ Gửi/nhận tin nhắn realtime qua WebSocket
- ✅ Hỗ trợ nhiều loại tin nhắn: text, image, file
- ✅ Trạng thái tin nhắn: Sent, Delivered, Read
- ✅ Thông báo đang gõ (typing indicator)
- ✅ Lịch sử tin nhắn với phân trang
- ✅ Quản lý phòng chat (chat rooms)
- ✅ Đếm tin nhắn chưa đọc

### Các Role được hỗ trợ
- **USER (Client)**: Khách hàng mua sắm
- **VENDOR**: Người bán hàng
- **ADMIN**: Quản trị viên hệ thống

### Quy tắc giao tiếp (BR-SUP-001)
| Người gửi | Người nhận | Cho phép |
|-----------|------------|----------|
| USER      | VENDOR     | ✅        |
| USER      | ADMIN      | ✅        |
| USER      | USER       | ❌        |
| VENDOR    | USER       | ✅        |
| VENDOR    | ADMIN      | ✅        |
| ADMIN     | USER       | ✅        |
| ADMIN     | VENDOR     | ✅        |

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────┐     WebSocket (STOMP)      ┌─────────────────┐
│   React App     │ ◄─────────────────────────► │  Spring Boot    │
│   (Frontend)    │                             │  (Backend)      │
│                 │     REST API (HTTP)         │                 │
│                 │ ◄─────────────────────────► │                 │
└─────────────────┘                             └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │    MongoDB      │
                                                │  - messages     │
                                                │  - chat_rooms   │
                                                └─────────────────┘
```

### Các Components chính

1. **WebSocket Config** (`WebSocketConfig.java`)
   - Cấu hình STOMP message broker
   - Xác thực JWT cho WebSocket connections

2. **ChatService** (`ChatService.java`)
   - Business logic chính
   - Validation theo SRS requirements

3. **ChatController** (`ChatController.java`)
   - REST APIs
   - WebSocket message handlers

4. **Repositories**
   - `MessageRepository`: Quản lý tin nhắn
   - `ChatRoomRepository`: Quản lý phòng chat

---

## 📜 Business Rules

### BR-SUP-001: Validation of Routing/Communication Pairs
- CLIENT không được gửi tin nhắn cho CLIENT khác
- Chỉ cho phép các cặp giao tiếp được định nghĩa trong bảng trên

### BR-SUP-003 & BR-SUP-004: Validation of Message Content
- Tin nhắn không được để trống (Error: MSG11)
- Tin nhắn tối đa 1000 ký tự (Error: MSG12)
- Tin nhắn không chứa từ cấm: "spam", "bad" (Error: MSG10)

---

## 📡 API Reference

### Base URL
```
http://localhost:8088/api/v1/chat
```

### Authentication
Tất cả các API đều yêu cầu JWT token trong header:
```
Authorization: Bearer <your_jwt_token>
```

---

### 1. Lấy danh sách Chat Rooms

**Endpoint:** `GET /rooms`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 0 | Số trang (bắt đầu từ 0) |
| size | int | 20 | Số lượng mỗi trang |

**Response:**
```json
{
  "code": 200,
  "message": "Lấy danh sách chat rooms thành công",
  "result": {
    "content": [
      {
        "id": "room_id",
        "partnerId": "user_id_of_partner",
        "partnerName": "Tên người chat cùng",
        "partnerAvatar": "https://...",
        "partnerRole": "VENDOR",
        "lastMessage": "Tin nhắn cuối cùng...",
        "lastMessageAt": "2024-12-12T10:30:00",
        "lastMessageSenderId": "sender_id",
        "unreadCount": 5,
        "createdAt": "2024-12-01T08:00:00"
      }
    ],
    "currentPage": 0,
    "pageSize": 20,
    "totalElements": 10,
    "totalPages": 1,
    "isFirst": true,
    "isLast": true,
    "hasNext": false,
    "hasPrevious": false,
    "isEmpty": false
  }
}
```

---

### 2. Lấy tất cả Chat Rooms (không phân trang)

**Endpoint:** `GET /rooms/all`

**Response:**
```json
{
  "code": 200,
  "message": "Lấy danh sách chat rooms thành công",
  "result": [
    {
      "id": "room_id",
      "partnerId": "user_id",
      "partnerName": "Tên",
      ...
    }
  ]
}
```

---

### 3. Tạo hoặc Lấy Chat Room

**Endpoint:** `POST /rooms`

**Request Body:**
```json
{
  "participantId": "user_id_to_chat_with"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Tạo/Lấy chat room thành công",
  "result": {
    "id": "room_id",
    "partnerId": "user_id",
    "partnerName": "Tên người chat cùng",
    ...
  }
}
```

---

### 4. Lấy Lịch sử Tin nhắn

**Endpoint:** `GET /rooms/{roomId}/messages`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| roomId | string | ID của chat room |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 0 | Số trang |
| size | int | 50 | Số lượng mỗi trang |

**Response:**
```json
{
  "code": 200,
  "message": "Lấy tin nhắn thành công",
  "result": {
    "content": [
      {
        "id": "message_id",
        "chatRoomId": "room_id",
        "senderId": "sender_user_id",
        "senderName": "Tên người gửi",
        "senderAvatar": "https://...",
        "receiverId": "receiver_user_id",
        "receiverName": "Tên người nhận",
        "content": "Nội dung tin nhắn",
        "type": "TEXT",
        "status": "SENT",
        "attachmentUrl": null,
        "attachmentName": null,
        "createdAt": "2024-12-12T10:30:00",
        "readAt": null
      }
    ],
    ...
  }
}
```

---

### 5. Gửi Tin nhắn (REST)

**Endpoint:** `POST /messages`

**Request Body:**
```json
{
  "receiverId": "receiver_user_id",
  "content": "Nội dung tin nhắn",
  "type": "TEXT",
  "attachmentUrl": null,
  "attachmentName": null
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Gửi tin nhắn thành công",
  "result": {
    "id": "message_id",
    "chatRoomId": "room_id",
    "senderId": "your_user_id",
    "content": "Nội dung tin nhắn",
    ...
  }
}
```

---

### 6. Đánh dấu Đã đọc

**Endpoint:** `POST /rooms/{roomId}/read`

**Response:**
```json
{
  "code": 200,
  "message": "Đã đánh dấu đã đọc thành công"
}
```

---

### 7. Đếm Tin nhắn chưa đọc

**Endpoint:** `GET /unread-count`

**Response:**
```json
{
  "code": 200,
  "message": "Lấy số tin nhắn chưa đọc thành công",
  "result": {
    "unreadCount": 15
  }
}
```

---

## 🔌 WebSocket Events

### Kết nối WebSocket

**Endpoint:** `ws://localhost:8088/ws` (hoặc với SockJS: `http://localhost:8088/ws`)

**Headers khi CONNECT:**
```
Authorization: Bearer <jwt_token>
```

### Subscribe Destinations

| Destination | Description |
|-------------|-------------|
| `/user/queue/messages` | Nhận tin nhắn gửi trực tiếp cho bạn |
| `/topic/chat/{roomId}` | Nhận tất cả events của một chat room cụ thể |

### Publish Destinations

| Destination | Payload | Description |
|-------------|---------|-------------|
| `/app/chat.send` | MessageRequest | Gửi tin nhắn |
| `/app/chat.typing/{roomId}` | `{ "typing": true/false }` | Thông báo đang gõ |
| `/app/chat.read/{roomId}` | (empty) | Đánh dấu đã đọc |

### Event Types

**1. NEW_MESSAGE**
```json
{
  "eventType": "NEW_MESSAGE",
  "chatRoomId": "room_id",
  "senderId": "sender_id",
  "timestamp": 1702380600000,
  "data": {
    "id": "message_id",
    "content": "Nội dung tin nhắn",
    ...
  }
}
```

**2. MESSAGE_READ**
```json
{
  "eventType": "MESSAGE_READ",
  "chatRoomId": "room_id",
  "senderId": "reader_id",
  "timestamp": 1702380600000
}
```

**3. TYPING**
```json
{
  "eventType": "TYPING",
  "chatRoomId": "room_id",
  "senderId": "typing_user_id",
  "data": true,
  "timestamp": 1702380600000
}
```

---

## 🎨 Hướng Dẫn Implement Frontend

### Cài đặt Dependencies

```bash
npm install @stomp/stompjs sockjs-client axios
npm install -D @types/sockjs-client
```

### 1. WebSocket Service (`services/websocket.ts`)

```typescript
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, any> = new Map();

  connect(token: string, onConnect: () => void, onError: (error: any) => void) {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8088/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => console.log('[WS Debug]', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      console.log('✅ WebSocket Connected');
      onConnect();
    };

    this.client.onStompError = (frame) => {
      console.error('❌ STOMP Error:', frame.headers['message']);
      onError(frame);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  // Subscribe to personal messages
  subscribeToPersonalMessages(userId: string, callback: (event: any) => void) {
    if (!this.client?.connected) return;

    const subscription = this.client.subscribe(
      `/user/queue/messages`,
      (message: IMessage) => {
        const event = JSON.parse(message.body);
        callback(event);
      }
    );

    this.subscriptions.set('personal', subscription);
  }

  // Subscribe to a specific chat room
  subscribeToChatRoom(roomId: string, callback: (event: any) => void) {
    if (!this.client?.connected) return;

    const subscription = this.client.subscribe(
      `/topic/chat/${roomId}`,
      (message: IMessage) => {
        const event = JSON.parse(message.body);
        callback(event);
      }
    );

    this.subscriptions.set(`room_${roomId}`, subscription);
  }

  // Unsubscribe from a chat room
  unsubscribeFromChatRoom(roomId: string) {
    const subscription = this.subscriptions.get(`room_${roomId}`);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(`room_${roomId}`);
    }
  }

  // Send a message
  sendMessage(receiverId: string, content: string, type: string = 'TEXT') {
    if (!this.client?.connected) return;

    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({
        receiverId,
        content,
        type,
      }),
    });
  }

  // Send typing indicator
  sendTyping(roomId: string, isTyping: boolean) {
    if (!this.client?.connected) return;

    this.client.publish({
      destination: `/app/chat.typing/${roomId}`,
      body: JSON.stringify({ typing: isTyping }),
    });
  }

  // Mark messages as read
  markAsRead(roomId: string) {
    if (!this.client?.connected) return;

    this.client.publish({
      destination: `/app/chat.read/${roomId}`,
      body: '',
    });
  }
}

export const wsService = new WebSocketService();
```

### 2. Chat API Service (`services/chatApi.ts`)

```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/v1/chat';

const api = axios.create({
  baseURL: API_BASE,
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const chatApi = {
  // Get chat rooms
  getChatRooms: async (page = 0, size = 20) => {
    const response = await api.get('/rooms', { params: { page, size } });
    return response.data.result;
  },

  // Get all chat rooms
  getAllChatRooms: async () => {
    const response = await api.get('/rooms/all');
    return response.data.result;
  },

  // Create or get chat room
  createOrGetChatRoom: async (participantId: string) => {
    const response = await api.post('/rooms', { participantId });
    return response.data.result;
  },

  // Get messages
  getMessages: async (roomId: string, page = 0, size = 50) => {
    const response = await api.get(`/rooms/${roomId}/messages`, {
      params: { page, size },
    });
    return response.data.result;
  },

  // Send message via REST
  sendMessage: async (receiverId: string, content: string, type = 'TEXT') => {
    const response = await api.post('/messages', {
      receiverId,
      content,
      type,
    });
    return response.data.result;
  },

  // Mark as read
  markAsRead: async (roomId: string) => {
    const response = await api.post(`/rooms/${roomId}/read`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get('/unread-count');
    return response.data.result.unreadCount;
  },
};
```

### 3. Chat Context (`contexts/ChatContext.tsx`)

```tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { wsService } from '../services/websocket';
import { chatApi } from '../services/chatApi';

interface ChatRoom {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  partnerRole: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: string;
  status: string;
  createdAt: string;
}

interface ChatContextType {
  chatRooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: Message[];
  isConnected: boolean;
  unreadCount: number;
  isTyping: { [roomId: string]: boolean };
  selectRoom: (room: ChatRoom) => void;
  sendMessage: (content: string) => void;
  loadMoreMessages: () => void;
  setTyping: (isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatContext must be used within ChatProvider');
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTypingState] = useState<{ [roomId: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(0);

  const currentUserId = localStorage.getItem('userId');

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    wsService.connect(
      token,
      () => {
        setIsConnected(true);
        // Subscribe to personal messages
        wsService.subscribeToPersonalMessages(currentUserId!, handleWebSocketEvent);
      },
      (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      }
    );

    return () => wsService.disconnect();
  }, []);

  // Load chat rooms
  useEffect(() => {
    loadChatRooms();
    loadUnreadCount();
  }, []);

  const loadChatRooms = async () => {
    try {
      const rooms = await chatApi.getAllChatRooms();
      setChatRooms(rooms);
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await chatApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleWebSocketEvent = useCallback((event: any) => {
    switch (event.eventType) {
      case 'NEW_MESSAGE':
        handleNewMessage(event.data);
        break;
      case 'MESSAGE_READ':
        handleMessageRead(event);
        break;
      case 'TYPING':
        handleTypingEvent(event);
        break;
    }
  }, []);

  const handleNewMessage = (message: Message) => {
    // Add to messages if in current room
    if (currentRoom?.id === message.chatRoomId) {
      setMessages((prev) => [message, ...prev]);
      // Mark as read
      wsService.markAsRead(message.chatRoomId);
    }

    // Update chat rooms list
    setChatRooms((prev) =>
      prev.map((room) =>
        room.id === message.chatRoomId
          ? {
              ...room,
              lastMessage: message.content,
              lastMessageAt: message.createdAt,
              unreadCount:
                room.id !== currentRoom?.id ? room.unreadCount + 1 : room.unreadCount,
            }
          : room
      )
    );

    // Update total unread count
    if (message.chatRoomId !== currentRoom?.id) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  const handleMessageRead = (event: any) => {
    if (currentRoom?.id === event.chatRoomId) {
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          status: msg.senderId === currentUserId ? 'READ' : msg.status,
        }))
      );
    }
  };

  const handleTypingEvent = (event: any) => {
    setIsTypingState((prev) => ({
      ...prev,
      [event.chatRoomId]: event.data,
    }));

    // Clear typing after 3 seconds
    setTimeout(() => {
      setIsTypingState((prev) => ({
        ...prev,
        [event.chatRoomId]: false,
      }));
    }, 3000);
  };

  const selectRoom = async (room: ChatRoom) => {
    setCurrentRoom(room);
    setMessages([]);
    setCurrentPage(0);

    // Subscribe to room
    wsService.subscribeToChatRoom(room.id, handleWebSocketEvent);

    // Load messages
    try {
      const result = await chatApi.getMessages(room.id, 0, 50);
      setMessages(result.content.reverse()); // Reverse to show oldest first
    } catch (error) {
      console.error('Failed to load messages:', error);
    }

    // Mark as read
    wsService.markAsRead(room.id);
    
    // Update unread count
    setChatRooms((prev) =>
      prev.map((r) => (r.id === room.id ? { ...r, unreadCount: 0 } : r))
    );
    setUnreadCount((prev) => Math.max(0, prev - room.unreadCount));
  };

  const sendMessage = (content: string) => {
    if (!currentRoom || !content.trim()) return;

    wsService.sendMessage(currentRoom.partnerId, content.trim());
  };

  const loadMoreMessages = async () => {
    if (!currentRoom) return;

    try {
      const nextPage = currentPage + 1;
      const result = await chatApi.getMessages(currentRoom.id, nextPage, 50);
      setMessages((prev) => [...result.content.reverse(), ...prev]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Failed to load more messages:', error);
    }
  };

  const setTyping = (typing: boolean) => {
    if (!currentRoom) return;
    wsService.sendTyping(currentRoom.id, typing);
  };

  return (
    <ChatContext.Provider
      value={{
        chatRooms,
        currentRoom,
        messages,
        isConnected,
        unreadCount,
        isTyping,
        selectRoom,
        sendMessage,
        loadMoreMessages,
        setTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
```

### 4. Chat Components

#### ChatList Component (`components/ChatList.tsx`)

```tsx
import React from 'react';
import { useChatContext } from '../contexts/ChatContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export const ChatList: React.FC = () => {
  const { chatRooms, currentRoom, selectRoom } = useChatContext();

  return (
    <div className="w-80 border-r border-gray-200 bg-white h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Tin nhắn</h2>
      </div>

      <div className="divide-y divide-gray-100">
        {chatRooms.map((room) => (
          <div
            key={room.id}
            onClick={() => selectRoom(room)}
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
              currentRoom?.id === room.id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={room.partnerAvatar || '/default-avatar.png'}
                  alt={room.partnerName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {room.partnerRole === 'ADMIN' && (
                  <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded">
                    Admin
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900 truncate">
                    {room.partnerName}
                  </h3>
                  {room.lastMessageAt && (
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(room.lastMessageAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-500 truncate">
                    {room.lastMessage || 'Chưa có tin nhắn'}
                  </p>
                  {room.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {chatRooms.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Chưa có cuộc hội thoại nào
          </div>
        )}
      </div>
    </div>
  );
};
```

#### ChatWindow Component (`components/ChatWindow.tsx`)

```tsx
import React, { useRef, useEffect, useState } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import { format } from 'date-fns';

export const ChatWindow: React.FC = () => {
  const {
    currentRoom,
    messages,
    isConnected,
    isTyping,
    sendMessage,
    setTyping,
    loadMoreMessages,
  } = useChatContext();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem('userId');

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  useEffect(() => {
    if (inputValue) {
      setTyping(true);
      const timeout = setTimeout(() => setTyping(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [inputValue]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-lg">Chọn một cuộc hội thoại để bắt đầu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
        <img
          src={currentRoom.partnerAvatar || '/default-avatar.png'}
          alt={currentRoom.partnerName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h3 className="font-medium text-gray-900">{currentRoom.partnerName}</h3>
          <span className="text-xs text-gray-500">
            {isConnected ? (
              <span className="text-green-500">● Online</span>
            ) : (
              <span className="text-gray-400">● Offline</span>
            )}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Load more button */}
        <button
          onClick={loadMoreMessages}
          className="w-full text-sm text-blue-500 hover:underline mb-4"
        >
          Tải thêm tin nhắn cũ hơn
        </button>

        {messages.map((message) => {
          const isMe = message.senderId === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                  isMe
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}
              >
                <p className="break-words">{message.content}</p>
                <div
                  className={`text-xs mt-1 ${
                    isMe ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {format(new Date(message.createdAt), 'HH:mm')}
                  {isMe && (
                    <span className="ml-2">
                      {message.status === 'READ' ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping[currentRoom.id] && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-2xl rounded-bl-md">
              <span className="animate-pulse">Đang nhập...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
```

#### ChatPage Component (`pages/ChatPage.tsx`)

```tsx
import React from 'react';
import { ChatProvider } from '../contexts/ChatContext';
import { ChatList } from '../components/ChatList';
import { ChatWindow } from '../components/ChatWindow';

export const ChatPage: React.FC = () => {
  return (
    <ChatProvider>
      <div className="h-screen flex bg-gray-100">
        <ChatList />
        <ChatWindow />
      </div>
    </ChatProvider>
  );
};
```

### 5. Chat Badge Component (`components/ChatBadge.tsx`)

```tsx
import React, { useEffect, useState } from 'react';
import { chatApi } from '../services/chatApi';

interface ChatBadgeProps {
  className?: string;
}

export const ChatBadge: React.FC<ChatBadgeProps> = ({ className }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const count = await chatApi.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to load unread count:', error);
      }
    };

    loadCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (unreadCount === 0) return null;

  return (
    <span
      className={`
        inline-flex items-center justify-center 
        px-2 py-1 text-xs font-bold leading-none 
        text-white bg-red-500 rounded-full
        ${className}
      `}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
};
```

---

## ❌ Error Codes

| Code | Enum | Message | Description |
|------|------|---------|-------------|
| MSG08 | MSG08_NO_PERMISSION | Bạn không có quyền thực hiện hành động này | Không có quyền (ví dụ: truy cập room không thuộc về mình) |
| MSG09 | MSG09_SENDING_FAILED | Gửi tin nhắn thất bại / Tuyến gửi không hợp lệ | Route không hợp lệ (USER -> USER) |
| MSG10 | MSG10_INAPPROPRIATE_CONTENT | Nội dung tin nhắn không phù hợp | Tin nhắn chứa từ cấm |
| MSG11 | MSG11_EMPTY_MESSAGE | Nội dung tin nhắn không được để trống | Tin nhắn rỗng |
| MSG12 | MSG12_MESSAGE_TOO_LONG | Nội dung tin nhắn quá dài (tối đa 1000 ký tự) | Tin nhắn > 1000 ký tự |

---

## ✨ Best Practices

### Backend
1. **Connection Management**: Sử dụng heartbeat để giữ connection alive
2. **Error Handling**: Log tất cả errors và gửi response phù hợp cho client
3. **Security**: Luôn validate JWT token trước khi cho phép gửi/nhận messages
4. **Performance**: Sử dụng indexes cho các trường thường query (senderId, receiverId, chatRoomId)

### Frontend
1. **Reconnection**: Implement auto-reconnect khi mất connection
2. **Message Queue**: Cache messages khi offline, gửi lại khi online
3. **Optimistic Updates**: Hiển thị message ngay khi gửi, update status sau
4. **Typing Debounce**: Chỉ gửi typing event sau khi user ngừng gõ 300ms

### Security
1. Không lưu JWT token trong localStorage cho production (sử dụng httpOnly cookies)
2. Validate tin nhắn cả ở frontend và backend
3. Rate limiting để tránh spam
4. Sanitize nội dung tin nhắn để tránh XSS

---

## 📁 Cấu Trúc Files

```
Backend (Spring Boot):
├── config/
│   ├── WebSocketConfig.java          # WebSocket configuration
│   └── SecurityConfig.java           # Security configuration (updated)
├── controllers/
│   └── ChatController.java           # REST & WebSocket controllers
├── services/
│   └── chat/
│       └── ChatService.java          # Business logic
├── repositories/
│   └── chat/
│       ├── MessageRepository.java    # Message repository
│       └── ChatRoomRepository.java   # ChatRoom repository
├── models/
│   └── chat/
│       ├── Message.java              # Message entity
│       └── ChatRoom.java             # ChatRoom entity
├── dtos/
│   ├── request/
│   │   └── chat/
│   │       ├── MessageRequest.java
│   │       ├── CreateChatRoomRequest.java
│   │       └── MarkReadRequest.java
│   └── response/
│       └── chat/
│           ├── MessageResponse.java
│           ├── ChatRoomResponse.java
│           └── ChatEventResponse.java
├── enums/
│   ├── MessageStatus.java            # SENT, DELIVERED, READ
│   └── MessageType.java              # TEXT, IMAGE, FILE, SYSTEM
└── exceptions/
    └── ErrorCode.java                # Updated with chat error codes

Frontend (React + Tailwind):
├── services/
│   ├── websocket.ts                  # WebSocket service
│   └── chatApi.ts                    # REST API service
├── contexts/
│   └── ChatContext.tsx               # Chat state management
├── components/
│   ├── ChatList.tsx                  # Chat rooms list
│   ├── ChatWindow.tsx                # Chat window
│   └── ChatBadge.tsx                 # Unread badge
└── pages/
    └── ChatPage.tsx                  # Main chat page
```

---

## 🚀 Quick Start

### Backend
1. Đảm bảo đã có WebSocket dependency trong `pom.xml`
2. Cấu hình MongoDB connection trong `application.properties`
3. Run Spring Boot application

### Frontend
1. Install dependencies: `npm install @stomp/stompjs sockjs-client axios date-fns`
2. Copy các files service và components vào project
3. Wrap app với `ChatProvider`
4. Sử dụng `ChatPage` component

---

**Tài liệu này được tạo bởi Cellex Team - December 2024**
