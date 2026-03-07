import React, { useEffect, useState } from 'react';
import ChatSidebar from './components/ChatSidebar';
import ChatWindow from './components/ChatWindow';
import AIChatWindow from './components/AIChatWindow';
import { useChat } from '@/hooks/useChat';

const VendorChatPage: React.FC = () => {
  const { initChat, disconnectChat } = useChat();
  const [showAIChat, setShowAIChat] = useState(false);

  useEffect(() => {
    initChat();
    return () => {
      disconnectChat();
    };
  }, [initChat, disconnectChat]);

  return (
    <div className="h-[calc(100vh-64px)] bg-white flex overflow-hidden">
      <ChatSidebar showAIChat={showAIChat} onShowAIChat={setShowAIChat} />
      {showAIChat ? (
        <AIChatWindow onBack={() => setShowAIChat(false)} />
      ) : (
        <ChatWindow />
      )}
    </div>
  );
};

export default VendorChatPage;