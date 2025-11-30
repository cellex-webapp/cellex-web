import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, Result, Button } from 'antd';
import useVnpay from '@/hooks/useVnpay';

const { Title, Text } = Typography;

const parseQuery = (search: string): Record<string, string> => {
  const params = new URLSearchParams(search);
  const obj: Record<string, string> = {};
  params.forEach((v, k) => { obj[k] = v; });
  return obj;
};

const VnpayReturnPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getStatus, paymentStatus } = useVnpay();
  const [checking, setChecking] = useState(false);
  const query = parseQuery(location.search);
  const responseCode = query['vnp_ResponseCode'];
  const orderId = query['orderId'] || query['vnp_TxnRef'];

  useEffect(() => {
    const fetchStatus = async () => {
      if (!orderId) return;
      setChecking(true);
      try {
        await getStatus(orderId);
      } finally {
        setChecking(false);
      }
    };
    fetchStatus();
  }, [orderId, getStatus]);

  const isSuccess = responseCode === '00';

  if (checking) {
    return <div className="flex items-center justify-center h-96"><Spin size="large" /></div>;
  }

  return (
    <div className="max-w-xl mx-auto p-4 md:p-8">
      <Card>
        <Title level={3}>Kết quả thanh toán VNPay</Title>
        {isSuccess ? (
          <Result
            status="success"
            title="Thanh toán thành công"
            subTitle={`Mã đơn hàng: ${orderId || '—'}`}
            extra={[
              <Button key="orders" type="primary" className="!bg-indigo-600" onClick={() => navigate('/account?tab=orders#orders')}>Xem đơn hàng</Button>,
              <Button key="home" onClick={() => navigate('/')}>Trang chủ</Button>,
            ]}
          />
        ) : (
          <Result
            status="error"
            title="Thanh toán thất bại hoặc bị hủy"
            subTitle={`Mã phản hồi: ${responseCode || '—'}`}
            extra={[
              <Button key="retry" type="primary" className="!bg-indigo-600" onClick={() => navigate('/checkout')}>Thử lại</Button>,
              <Button key="home" onClick={() => navigate('/')}>Trang chủ</Button>,
            ]}
          />
        )}
        {paymentStatus && (
          <Text type="secondary" className="block mt-4 text-xs">
            Trạng thái: {JSON.stringify(paymentStatus)}
          </Text>
        )}
      </Card>
    </div>
  );
};

export default VnpayReturnPage;
