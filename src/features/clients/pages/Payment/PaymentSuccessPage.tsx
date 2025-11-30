import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Result, Button, Typography } from 'antd';

const { Text } = Typography;

const useQuery = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  return {
    orderId: params.get('orderId') || '',
    responseCode: params.get('responseCode') || '',
    message: params.get('message') || '',
  };
};

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderId, responseCode, message } = useQuery();

  return (
    <div className="max-w-xl mx-auto p-4 md:p-8">
      <Card>
        <Result
            status="success"
            title="Thanh toán thành công"
            subTitle={
              <div>
                {orderId && <Text className="block">Mã đơn hàng: <strong>{orderId}</strong></Text>}
                {/* {responseCode && <Text className="block">Mã phản hồi: <strong>{responseCode}</strong></Text>} */}
                {message && <Text className="block">Thông báo: {decodeURIComponent(message)}</Text>}
              </div>
            }
            extra={[
              <Button key="orders" type="primary" className="!bg-indigo-600" onClick={() => navigate('/account?tab=orders#orders')}>Xem đơn hàng</Button>,
              <Button key="home" onClick={() => navigate('/')}>Trang chủ</Button>,
            ]}
          />
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
