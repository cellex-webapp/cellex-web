import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Spin, Tooltip, Badge } from 'antd';
import { 
  SendOutlined, 
  RobotOutlined, 
  PlusOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
  // StarOutlined
} from '@ant-design/icons';
import { useAIChat } from '@/hooks/useAIChat';
import AIMessageBubble from '@/features/clients/components/AIChat/AIMessageBubble';
import AIConversationList from '@/features/clients/components/AIChat/AIConversationList';

interface AIChatWindowProps {
  onBack?: () => void;
}

const AIChatWindow: React.FC<AIChatWindowProps> = ({ onBack }) => {
  const {
    conversations,
    activeConversationId,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    userRole,
    loadConversations,
    selectConversation,
    loadMoreMessages,
    sendMessage,
    startNewConversation,
    deleteConversation,
  } = useAIChat();

  const [inputValue, setInputValue] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  // Load conversations and start new conversation on mount
  useEffect(() => {
    loadConversations();
    // Always start with a new conversation when opening AI chat
    startNewConversation();
  }, [loadConversations, startNewConversation]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeConversationId]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;
    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onScroll = () => {
    if (scrollContainerRef.current && scrollContainerRef.current.scrollTop === 0) {
      loadMoreMessages();
    }
  };

  const handleDeleteConversation = async (id: string) => {
    // Delete the conversation without navigating to it
    await deleteConversation(id);
  };

  const getRoleGreeting = () => {
    switch (userRole) {
      case 'VENDOR':
        return 'Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp bạn phân tích doanh thu, quản lý sản phẩm, và đề xuất chiến lược kinh doanh.';
      case 'ADMIN':
        return 'Xin chào Admin! Tôi có thể giúp bạn tổng hợp báo cáo toàn hệ thống, phân tích phân khúc khách hàng, và đề xuất chiến lược marketing.';
      default:
        return 'Xin chào! Tôi là trợ lý AI của Cellex. Tôi có thể giúp bạn tìm kiếm sản phẩm, so sánh cấu hình, và tư vấn mua sắm.';
    }
  };

  const getSuggestions = () => {
    switch (userRole) {
      case 'VENDOR':
        return [
          'Báo cáo doanh thu tháng này',
          'Sản phẩm bán chạy nhất',
          'Cảnh báo hàng tồn kho thấp',
          'Gợi ý tạo mã giảm giá'
        ];
      case 'ADMIN':
        return [
          'Tổng hợp doanh thu hệ thống',
          'Phân tích phân khúc khách hàng',
          'Tổng quan hệ thống hôm nay',
          'Gợi ý điều chỉnh segment'
        ];
      default:
        return [
          'Gợi ý laptop dưới 30 triệu',
          'Gợi ý dòng điện thoại cho sinh viên',
          'Điện thoại pin trâu nhất',
          'Sản phẩm đang hot'
        ];
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-4 py-3 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <Tooltip title="Quay lại">
              <Button 
                type="text" 
                shape="circle" 
                icon={<ArrowLeftOutlined className="text-white" />}
                onClick={onBack}
                className="hover:bg-white/20"
              />
            </Tooltip>
          )}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <RobotOutlined className="text-white text-xl" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
          </div>
          <div className="flex flex-col leading-tight">
            <h3 className="font-bold text-white mt-4 text-sm flex items-center gap-2">
              Cellex AI Assistant
              <Badge count="AI" style={{ backgroundColor: '#f59e0b' }} />
            </h3>
            <span className="text-xs text-white/80 mt-[-3px]">Powered by Cellex</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Tooltip title="Lịch sử hội thoại">
            <Button 
              type="text" 
              shape="circle" 
              icon={<HistoryOutlined className="text-white" />}
              onClick={() => setShowHistory(!showHistory)}
              className={`hover:bg-white/20 ${showHistory ? 'bg-white/20' : ''}`}
            />
          </Tooltip>
          <Tooltip title="Cuộc hội thoại mới">
            <Button 
              type="text" 
              shape="circle" 
              icon={<PlusOutlined className="text-white" />}
              onClick={startNewConversation}
              className="hover:bg-white/20"
            />
          </Tooltip>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar lịch sử (có thể ẩn/hiện) */}
        {showHistory && (
          <div className="w-64 border-r border-gray-200 bg-white overflow-y-auto shrink-0">
            <AIConversationList 
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={(id) => {
                selectConversation(id);
                setShowHistory(false);
              }}
              onDelete={handleDeleteConversation}
              isLoading={isLoadingConversations}
            />
          </div>
        )}

        {/* Main chat area */}
        <div className="flex-1/2 max-h-7/8 flex flex-col overflow-hidden">
          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
            ref={scrollContainerRef}
            onScroll={onScroll}
          >
            {isLoadingMessages && messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <Spin size="large" tip="Đang tải..." />
              </div>
            ) : messages.length === 0 ? (
              // Welcome screen
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                  <RobotOutlined className="text-4xl text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Chào mừng đến với Cellex AI! ✨
                </h2>
                <p className="text-gray-600 mb-6 max-w-md">
                  {getRoleGreeting()}
                </p>
                
                {/* Quick suggestions */}
                <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                  {getSuggestions().map((suggestion, index) => (
                    <Button
                      key={index}
                      size="small"
                      className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                      onClick={() => {
                        setInputValue(suggestion);
                        inputRef.current?.focus();
                      }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {isLoadingMessages && (
                  <div className="text-center py-2">
                    <Spin size="small" />
                  </div>
                )}
                
                {messages.map((msg) => (
                  <AIMessageBubble 
                    key={msg.id} 
                    message={msg}
                    isUser={msg.messageType === 'USER'}
                  />
                ))}
                
                {isSending && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <RobotOutlined className="text-white text-sm" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2">
                        <Spin size="small" />
                        <span className="text-gray-500 text-sm">Đang suy nghĩ...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input area */}
          <div className="bg-white border-t border-gray-200 p-4 shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-3 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-md transition-all p-2">
                <Input.TextArea 
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    userRole === 'VENDOR' 
                      ? 'Hỏi về doanh thu, sản phẩm, đơn hàng...' 
                      : userRole === 'ADMIN'
                      ? 'Hỏi về báo cáo hệ thống, phân khúc khách hàng...'
                      : 'Tìm sản phẩm, so sánh, tư vấn mua sắm...'
                  }
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  className="!bg-transparent !border-0 !shadow-none !resize-none flex-1"
                  disabled={isSending}
                />
                <Button
                  type="primary"
                  shape="circle"
                  size="middle"
                  icon={<SendOutlined />}
                  onClick={handleSend}
                  loading={isSending}
                  disabled={!inputValue.trim()}
                  className={`${inputValue.trim() ? '!bg-gradient-to-r !from-blue-600 !to-purple-600' : '!bg-gray-300'} !border-none shadow-sm`}
                />
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatWindow;
