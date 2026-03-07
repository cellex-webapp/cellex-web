import React, { useEffect } from 'react';
import { AIChatContainer } from '@/features/clients/components/AIChat';
import { useAIChat } from '@/hooks/useAIChat';

const AIChatPage: React.FC = () => {
  const { startNewConversation } = useAIChat();

  // Always start with a new conversation when opening AI chat page
  useEffect(() => {
    startNewConversation();
  }, [startNewConversation]);

  return (
    <div className="h-[calc(100vh-64px)]">
      <AIChatContainer />
    </div>
  );
};

export default AIChatPage;
