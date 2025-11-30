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

const PaymentFailurePage: React.FC = () => {
  const navigate = useNavigate();
  const { orderId, responseCode, message } = useQuery();

  return (
    <div className="max-w-xl mx-auto p-4 md:p-8">
      <Card>
        <Result
          status="error"
          title="Thanh toán thất bại"
          subTitle={
            <div>
              {orderId && <Text className="block">Mã đơn hàng: <strong>{orderId}</strong></Text>}
              {/* {responseCode && <Text className="block">Mã phản hồi: <strong>{responseCode}</strong></Text>} */}
              {message && <Text className="block">Thông báo: {decodeURIComponent(message)}</Text>}
            </div>
          }
          extra={[
            orderId ? <Button key="confirm" type="primary" className="!bg-indigo-600" onClick={() => navigate(`/order/confirm/${orderId}`)}>Quay lại xác nhận</Button> : null,
            <Button key="home" onClick={() => navigate('/')}>Trang chủ</Button>,
          ]}
        />
      </Card>
    </div>
  );
};

export default PaymentFailurePage;
