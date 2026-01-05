import React from 'react';
import { List, Typography, Spin, Empty, Button, Popconfirm } from 'antd';
import { MessageOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { AIConversation } from '@/services/ai.service';
import moment from 'moment-timezone';

const { Text } = Typography;

interface AIConversationListProps {
  conversations: AIConversation[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const AIConversationList: React.FC<AIConversationListProps> = ({
  conversations,
  activeId,
  onSelect,
  onDelete,
  isLoading,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-100">
        <Button 
          type="dashed" 
          icon={<PlusOutlined />} 
          block
          onClick={() => onSelect(null)}
          className="hover:border-blue-400 hover:text-blue-600"
        >
          Cuộc hội thoại mới
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && conversations.length === 0 ? (
          <div className="p-8 text-center">
            <Spin size="small" />
          </div>
        ) : conversations.length === 0 ? (
          <Empty 
            description="Chưa có cuộc hội thoại nào" 
            className="mt-10"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={conversations}
            renderItem={(conv) => (
              <div
                className={`cursor-pointer transition-all px-3 py-2 border-b border-gray-50 hover:bg-gray-50 group ${
                  activeId === conv.id ? 'bg-blue-50 border-l-2 !border-l-blue-600' : ''
                }`}
                onClick={() => onSelect(conv.id)}
              >
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageOutlined className="text-blue-600 text-xs" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <Text strong ellipsis className="text-sm text-gray-800 max-w-[120px]">
                        {conv.title || 'Cuộc hội thoại mới'}
                      </Text>
                      <Popconfirm
                        title="Xóa cuộc hội thoại này?"
                        onConfirm={() => onDelete(conv.id)}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined className="text-gray-400" />}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popconfirm>
                    </div>
                    <Text type="secondary" ellipsis className="text-xs block">
                      {conv.lastMessage || 'Bắt đầu cuộc trò chuyện'}
                    </Text>
                    <Text type="secondary" className="text-[10px]">
                      {conv.lastMessageAt ? moment(conv.lastMessageAt).fromNow() : ''}
                    </Text>
                  </div>
                </div>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default AIConversationList;
