import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux'; 
import {
  fetchChatRooms,
  fetchMessages,
  sendMessage,
  createOrGetRoom,
  markRoomAsRead,
  setActiveRoom,
  receiveRealtimeMessage,
  fetchUnreadCount
} from '@/stores/slices/chat.slice';
import {
  selectChatRooms,
  selectActiveRoomId,
  selectCurrentRoomMessages,
  selectMessagePagination,
  selectIsLoadingRooms,
  selectIsLoadingMessages,
  selectIsSendingMessage,
  selectTotalUnreadCount,
  selectActiveRoom
} from '@/stores/selectors/chat.selector';
import { wsService } from '@/services/websocket';

export const useChat = () => {
  const dispatch = useAppDispatch();

  const rooms = useAppSelector(selectChatRooms);
  const activeRoomId = useAppSelector(selectActiveRoomId);
  const activeRoom = useAppSelector(selectActiveRoom);
  const messages = useAppSelector(selectCurrentRoomMessages);
  const pagination = useAppSelector(selectMessagePagination);
  const totalUnread = useAppSelector(selectTotalUnreadCount);
  
  const isLoadingRooms = useAppSelector(selectIsLoadingRooms);
  const isLoadingMessages = useAppSelector(selectIsLoadingMessages);
  const isSending = useAppSelector(selectIsSendingMessage);

  const initChat = useCallback(() => {
    dispatch(fetchChatRooms({ page: 0, size: 20 }));
    dispatch(fetchUnreadCount());
    // Connect WS and subscribe to user queue for Admin realtime
    wsService.connect((evt) => {
      if (evt.eventType === 'NEW_MESSAGE' && evt.data) {
        dispatch(receiveRealtimeMessage(evt.data as IMessage));
        if (evt.chatRoomId !== activeRoomId) {
          dispatch(fetchUnreadCount());
        } else {
          dispatch(markRoomAsRead(evt.chatRoomId));
        }
      }
    });
  }, [dispatch, activeRoomId]);

  const disconnectChat = useCallback(() => {
    wsService.disconnect();
  }, []);

  const selectRoom = useCallback((roomId: string) => {
    if (activeRoomId === roomId) return;
    // Unsubscribe previous room topic
    if (activeRoomId) wsService.unsubscribeRoom(activeRoomId);
    dispatch(setActiveRoom(roomId));
    dispatch(markRoomAsRead(roomId));
    dispatch(fetchMessages({ roomId, params: { page: 0, size: 50 } }));
    // Subscribe topic for selected room
    wsService.subscribeRoom(roomId);
  }, [dispatch, activeRoomId]);
  const loadMoreMessages = useCallback(() => {
    if (activeRoomId && pagination.hasNext && !isLoadingMessages) {
      dispatch(fetchMessages({ 
        roomId: activeRoomId, 
        params: { page: pagination.page + 1, size: pagination.size } 
      }));
    }
  }, [dispatch, activeRoomId, pagination, isLoadingMessages]);

  const sendMsg = useCallback(async (content: string, type: MessageType = 'TEXT', file?: { url: string, name: string }) => {
    if (!activeRoom) return;
    const payload = {
      receiverId: activeRoom.partnerId,
      content,
      type,
      attachmentUrl: file?.url,
      attachmentName: file?.name
    };

    await dispatch(sendMessage(payload));
  }, [dispatch, activeRoom]);

  const startChatWithUser = useCallback(async (userId: string) => {
    const resultAction = await dispatch(createOrGetRoom({ participantId: userId }));
    if (createOrGetRoom.fulfilled.match(resultAction)) {
      const room = resultAction.payload;
      selectRoom(room.id);
      return room;
    }
    return null;
  }, [dispatch, selectRoom]);

  const onReceiveSocketMessage = useCallback((message: IMessage) => {
    dispatch(receiveRealtimeMessage(message));
    if (message.chatRoomId !== activeRoomId) {
       dispatch(fetchUnreadCount()); 
    } else {
       dispatch(markRoomAsRead(message.chatRoomId));
    }
  }, [dispatch, activeRoomId]);

  return {
    rooms,
    activeRoom,
    activeRoomId,
    messages,
    pagination,
    totalUnread,
    
    isLoadingRooms,
    isLoadingMessages,
    isSending,

    initChat,
    disconnectChat,
    selectRoom,
    loadMoreMessages,
    sendMsg,
    startChatWithUser,
    onReceiveSocketMessage
  };
};