import React from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

const MyOrder: React.FC = () => (
  <div>
    <Title level={4}>Đơn hàng của tôi</Title>
    <Text>Danh sách đơn hàng sẽ hiển thị ở đây.</Text>
  </div>
);

export default MyOrder;
