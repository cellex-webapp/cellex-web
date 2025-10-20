import React from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

const Chat: React.FC = () => (
  <div>
    <Title level={4}>Trung tâm tin nhắn</Title>
    <Text>Hộp thư và tin nhắn sẽ hiển thị ở đây.</Text>
  </div>
);

export default Chat;
