import React from 'react';
import { List, Avatar, Badge, Input, Typography, Spin, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useChat } from '@/hooks/useChat';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text } = Typography;

const ChatSidebar: React.FC = () => {
  const { rooms, activeRoomId, selectRoom, isLoadingRooms } = useChat();

  return (
    <div className="w-80 border-r border-gray-200 h-full flex flex-col bg-white shrink-0">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold mb-3 text-gray-800">Tin nhắn</h2>
        <Input 
          prefix={<SearchOutlined className="text-gray-400" />} 
          placeholder="Tìm khách hàng..." 
          className="rounded-full bg-gray-50 border-gray-200 hover:bg-white focus:bg-white transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoadingRooms && rooms.length === 0 ? (
          <div className="p-8 text-center"><Spin /></div>
        ) : rooms.length === 0 ? (
          <Empty description="Chưa có tin nhắn nào" className="mt-10" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={rooms}
            renderItem={(room) => (
              <List.Item 
                className={`cursor-pointer transition-all !px-4 py-3 border-gray-50 hover:bg-gray-50 ${
                  activeRoomId === room.id ? 'bg-blue-50/60 border-r-4 !border-r-blue-600' : ''
                }`}
                onClick={() => selectRoom(room.id)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge count={room.unreadCount} size="small" offset={[-5, 5]} color="red">
                      <Avatar src={room.partnerAvatar} size={48} className="border border-gray-200 bg-gray-100">
                        {room.partnerName?.charAt(0)?.toUpperCase()}
                      </Avatar>
                    </Badge>
                  }
                  title={
                    <div className="flex justify-between items-center mb-1">
                      <Text strong ellipsis className="max-w-[140px] text-gray-800">{room.partnerName}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }} className="whitespace-nowrap ml-2">
                        {room.lastMessageAt ? dayjs(room.lastMessageAt).fromNow(true) : ''}
                      </Text>
                    </div>
                  }
                  description={
                    <Text type="secondary" ellipsis className={`block max-w-[200px] text-xs ${room.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                      {room.lastMessage || 'Bắt đầu cuộc trò chuyện'}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;