import { type RootState } from '@/stores/store'; 

const selectChatState = (state: RootState) => state.chat;
export const selectChatRooms = (state: RootState) => selectChatState(state).rooms;
export const selectActiveRoomId = (state: RootState) => selectChatState(state).activeRoomId;
export const selectActiveRoom = (state: RootState) => {
  const { rooms, activeRoomId } = selectChatState(state);
  return rooms.find((room) => room.id === activeRoomId) || null;
};
export const selectCurrentRoomMessages = (state: RootState) => selectChatState(state).currentRoomMessages;
export const selectMessagePagination = (state: RootState) => selectChatState(state).messagePagination;
export const selectIsLoadingRooms = (state: RootState) => selectChatState(state).isLoadingRooms;
export const selectIsLoadingMessages = (state: RootState) => selectChatState(state).isLoadingMessages;
export const selectIsSendingMessage = (state: RootState) => selectChatState(state).isSendingMessage;
export const selectTotalUnreadCount = (state: RootState) => selectChatState(state).totalUnreadCount;