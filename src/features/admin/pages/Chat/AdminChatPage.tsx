import React, { useEffect } from 'react';
import ChatSidebar from '@/features/vendors/pages/Chat/components/ChatSidebar';
import ChatWindow from '@/features/vendors/pages/Chat/components/ChatWindow';
import { useChat } from '@/hooks/useChat';

const AdminChatPage: React.FC = () => {
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

export default AdminChatPage;
