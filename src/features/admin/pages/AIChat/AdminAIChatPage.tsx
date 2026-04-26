import React, { useEffect } from 'react';
import { AIChatContainer } from '@/features/clients/components/AIChat';
import { useAIChat } from '@/hooks/useAIChat';

/**
 * Dedicated AI Chat page for ADMIN.
 * Uses the same AIChatContainer as the client, which adapts based on user role.
 */
const AdminAIChatPage: React.FC = () => {
  const { startNewConversation } = useAIChat();

  useEffect(() => {
    startNewConversation();
  }, [startNewConversation]);

  return (
    <div className="h-[calc(100vh-64px)]">
      <AIChatContainer />
    </div>
  );
};

export default AdminAIChatPage;
