import React from 'react';
import { Avatar, Image } from 'antd';
import dayjs from 'dayjs';

interface Props {
  data: IMessage;
  isMine: boolean;
}

const MessageBubble: React.FC<Props> = ({ data, isMine }) => {
  return (
    <div className={`flex gap-3 mb-4 ${isMine ? 'flex-row-reverse' : ''}`}>
      {!isMine && (
        <Avatar src={data.senderAvatar} className="mt-1 flex-shrink-0">
          {data.senderName?.charAt(0)}
        </Avatar>
      )}
      
      <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {/* Bong bóng nội dung */}
        <div 
          className={`px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words shadow-sm ${
            isMine 
              ? 'bg-blue-600 text-white rounded-br-none' 
              : 'bg-white border text-gray-800 rounded-bl-none'
          }`}
        >
          {data.type === 'IMAGE' ? (
            <Image 
              src={data.attachmentUrl} 
              alt="attachment" 
              width={150} 
              className="rounded-lg object-cover"
            />
          ) : data.type === 'FILE' ? (
            <a href={data.attachmentUrl} target="_blank" rel="noreferrer" className={isMine ? 'text-white underline' : 'text-blue-600 underline'}>
              📎 {data.attachmentName || 'Tệp đính kèm'}
            </a>
          ) : (
            data.content
          )}
        </div>
        
        {/* Thời gian */}
        <span className="text-[10px] text-gray-400 mt-1 px-1">
          {dayjs(data.createdAt).format('HH:mm')}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;