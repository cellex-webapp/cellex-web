import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Upload, Empty, Spin, Avatar, Tooltip } from 'antd';
import { SendOutlined, PaperClipOutlined, PictureOutlined, MoreOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import MessageBubble from './MessageBubble';

const ChatWindow: React.FC = () => {
  const { 
    activeRoom, 
    messages, 
    sendMsg, 
    loadMoreMessages, 
    isLoadingMessages,
    isSending 
  } = useChat();
  
  const inputRef = useRef<any>(null);
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id;

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRoom && inputRef.current) {
      setTimeout(() => inputRef.current.focus({ cursor: 'end' }), 50);
    }
  }, [activeRoom]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeRoom]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMsg(inputValue);
    setInputValue('');
    setTimeout(() => inputRef.current?.focus(), 10);
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

  if (!activeRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-full">
        <Empty 
          description={<span className="text-gray-500">Chọn một cuộc hội thoại để bắt đầu</span>} 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] overflow-hidden relative">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar src={activeRoom.partnerAvatar} size={42} className="border border-gray-200">
              {activeRoom.partnerName?.charAt(0)}
            </Avatar>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 m-0 leading-tight text-base">{activeRoom.partnerName}</h3>
            <span className="text-xs text-green-600 font-medium">Đang hoạt động</span>
          </div>
        </div>
        <div className="flex gap-1">
           <Tooltip title="Thông tin khách hàng">
             <Button type="text" shape="circle" icon={<InfoCircleOutlined className="text-gray-500 text-lg" />} />
           </Tooltip>
           <Button type="text" shape="circle" icon={<MoreOutlined className="text-gray-500 text-lg" />} />
        </div>
      </div>

      <div 
        className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar scroll-smooth" 
        ref={scrollContainerRef}
        onScroll={onScroll}
      >
        {isLoadingMessages && <div className="text-center py-4"><Spin size="small" tip="Tải tin nhắn cũ..." /></div>}
        
        <div className="flex flex-col gap-1 pb-2">
          {[...messages].reverse().map((msg, index) => {
             return (
                <MessageBubble 
                  key={msg.id} 
                  data={msg} 
                  isMine={msg.senderId === currentUserId}
                />
             )
          })}
        </div>
        
        <div ref={messagesEndRef} className="h-px w-full" />
      </div>

      <div className="bg-white p-4 border-t border-gray-200 shrink-0 z-20">
        <div className="flex gap-3 items-end max-w-5xl mx-auto bg-gray-50 p-2 rounded-3xl border border-gray-200 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-md transition-all">
          
          <div className="flex gap-1 shrink-0 pb-1 pl-1">
            <Upload showUploadList={false}>
              <Tooltip title="Đính kèm file">
                <Button icon={<PaperClipOutlined className="text-gray-500" />} type="text" shape="circle" className="hover:bg-gray-200" />
              </Tooltip>
            </Upload>
            <Upload showUploadList={false} accept="image/*">
              <Tooltip title="Gửi ảnh">
                <Button icon={<PictureOutlined className="text-gray-500" />} type="text" shape="circle" className="hover:bg-gray-200" />
              </Tooltip>
            </Upload>
          </div>
          
          <Input.TextArea 
            value={inputValue}
            ref={inputRef}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..." 
            autoSize={{ minRows: 1, maxRows: 5 }}
            className="!bg-transparent !border-0 !shadow-none !resize-none text-gray-700 !px-0 py-2 focus:ring-0"
            style={{ marginBottom: '1px' }} 
          />
          
          <div className="pb-1 pr-1 shrink-0">
            <Button 
              type="primary" 
              shape="circle" 
              icon={<SendOutlined />} 
              size="large"
              className={`${inputValue.trim() ? '!bg-blue-600 !scale-100' : '!bg-gray-300 !scale-90 opacity-70'} transition-all duration-200 shadow-sm border-none`}
              onClick={handleSend}
              loading={isSending}
              disabled={!inputValue.trim()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;