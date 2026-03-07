import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  fetchAIConversations,
  fetchAIMessages,
  sendAIMessage,
  createAIConversation,
  deleteAIConversation,
  setActiveConversation,
  clearAIChat,
  addUserMessage,
} from '@/stores/slices/ai.slice';
import {
  selectAIConversations,
  selectActiveConversationId,
  selectActiveConversation,
  selectCurrentAIMessages,
  selectAIMessagePagination,
  selectIsLoadingAIConversations,
  selectIsLoadingAIMessages,
  selectIsSendingAIMessage,
  selectAIError,
  selectLastAIResponse,
} from '@/stores/selectors/ai.selector';
import { useAuth } from '@/hooks/useAuth';
import type { AIChatRequest } from '@/services/ai.service';

export const useAIChat = () => {
  const dispatch = useAppDispatch();
  const { currentUser, currentShop, userRole } = useAuth();

  // Selectors
  const conversations = useAppSelector(selectAIConversations);
  const activeConversationId = useAppSelector(selectActiveConversationId);
  const activeConversation = useAppSelector(selectActiveConversation);
  const messages = useAppSelector(selectCurrentAIMessages);
  const pagination = useAppSelector(selectAIMessagePagination);
  const lastResponse = useAppSelector(selectLastAIResponse);
  
  const isLoadingConversations = useAppSelector(selectIsLoadingAIConversations);
  const isLoadingMessages = useAppSelector(selectIsLoadingAIMessages);
  const isSending = useAppSelector(selectIsSendingAIMessage);
  const error = useAppSelector(selectAIError);

  // Actions
  const loadConversations = useCallback(() => {
    dispatch(fetchAIConversations({ page: 1, limit: 20 }));
  }, [dispatch]);

  const selectConversation = useCallback((conversationId: string | null) => {
    dispatch(setActiveConversation(conversationId));
    if (conversationId) {
      dispatch(fetchAIMessages({ conversationId, params: { page: 1, limit: 50 } }));
    }
  }, [dispatch]);

  const loadMoreMessages = useCallback(() => {
    if (activeConversationId && pagination.hasNext && !isLoadingMessages) {
      dispatch(fetchAIMessages({
        conversationId: activeConversationId,
        params: { page: pagination.page + 2, limit: pagination.size }
      }));
    }
  }, [dispatch, activeConversationId, pagination, isLoadingMessages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const request: AIChatRequest = {
      message: content,
      conversationId: activeConversationId || undefined,
      shopId: userRole === 'VENDOR' ? currentShop?.id : undefined,
    };

    // Add user message locally for immediate feedback
    if (activeConversationId) {
      dispatch(addUserMessage({ content, conversationId: activeConversationId }));
      await dispatch(sendAIMessage(request));
    } else {
      // Create new conversation
      await dispatch(createAIConversation(request));
    }
  }, [dispatch, activeConversationId, currentShop, userRole]);

  const startNewConversation = useCallback(() => {
    dispatch(clearAIChat());
  }, [dispatch]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    await dispatch(deleteAIConversation(conversationId));
  }, [dispatch]);

  const clearChat = useCallback(() => {
    dispatch(clearAIChat());
  }, [dispatch]);

  return {
    // State
    conversations,
    activeConversationId,
    activeConversation,
    messages,
    pagination,
    lastResponse,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    error,
    
    // User info
    currentUser,
    userRole,
    
    // Actions
    loadConversations,
    selectConversation,
    loadMoreMessages,
    sendMessage,
    startNewConversation,
    deleteConversation,
    clearChat,
  };
};
