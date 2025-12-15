import React, { useEffect } from 'react';
import ChatSidebar from './components/ChatSidebar';
import ChatWindow from './components/ChatWindow';
import { useChat } from '@/hooks/useChat';

const VendorChatPage: React.FC = () => {
  const { initChat, disconnectChat } = useChat();

  useEffect(() => {
    initChat();
    return () => {
      disconnectChat();
    };
  }, [initChat, disconnectChat]);

  return (
    <div className="h-[calc(100vh-64px)] bg-white flex overflow-hidden">
      <ChatSidebar />
      <ChatWindow />
    </div>
  );
};

export default VendorChatPage;