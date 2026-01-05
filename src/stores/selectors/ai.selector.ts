import { createSelector } from '@reduxjs/toolkit';
import { store } from '@/stores/store';

type RootState = ReturnType<typeof store.getState>;

const selectAIState = (state: RootState) => state.ai;

export const selectAIConversations = createSelector(
  selectAIState,
  (ai) => ai.conversations
);

export const selectActiveConversationId = createSelector(
  selectAIState,
  (ai) => ai.activeConversationId
);

export const selectActiveConversation = createSelector(
  [selectAIState, selectActiveConversationId],
  (ai, activeId) => ai.conversations.find(c => c.id === activeId) || null
);

export const selectCurrentAIMessages = createSelector(
  selectAIState,
  (ai) => ai.currentMessages
);

export const selectAIMessagePagination = createSelector(
  selectAIState,
  (ai) => ai.messagePagination
);

export const selectIsLoadingAIConversations = createSelector(
  selectAIState,
  (ai) => ai.isLoadingConversations
);

export const selectIsLoadingAIMessages = createSelector(
  selectAIState,
  (ai) => ai.isLoadingMessages
);

export const selectIsSendingAIMessage = createSelector(
  selectAIState,
  (ai) => ai.isSendingMessage
);

export const selectAIError = createSelector(
  selectAIState,
  (ai) => ai.error
);

export const selectLastAIResponse = createSelector(
  selectAIState,
  (ai) => ai.lastResponse
);
