import React, { useEffect, useState } from 'react';
import ChatSidebar from '@/features/vendors/pages/Chat/components/ChatSidebar';
import ChatWindow from '@/features/vendors/pages/Chat/components/ChatWindow';
import AIChatWindow from '@/features/vendors/pages/Chat/components/AIChatWindow';
import { useChat } from '@/hooks/useChat';

const AdminChatPage: React.FC = () => {
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

export default AdminChatPage;
