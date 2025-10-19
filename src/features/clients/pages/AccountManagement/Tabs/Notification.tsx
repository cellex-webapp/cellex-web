import React from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

const NotificationTab: React.FC = () => (
  <div>
    <Title level={4}>Trung tâm thông báo</Title>
    <Text>Nội dung trung tâm thông báo sẽ hiển thị ở đây.</Text>
  </div>
);

export default NotificationTab;
