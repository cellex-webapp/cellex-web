import React, { useCallback, useEffect, useState } from 'react';
import { Card, Radio, Typography, Button, Space, message, Spin, Statistic } from 'antd';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';
import useVnpay from '@/hooks/useVnpay';
import { useAuth } from '@/hooks/useAuth';
import orderService from '@/services/order.service';

const { Title, Text } = Typography;

const CheckoutPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { items, totalPrice, fetchMyCart, isLoading: cartLoading } = useCart();
  const { createPayment, isLoading: paying, error, reset } = useVnpay();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    if (currentUser) fetchMyCart();
  }, [currentUser, fetchMyCart]);

  const handleCheckout = useCallback(async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!items || items.length === 0) {
      message.warning('Giỏ hàng trống');
      return;
    }

    setCreatingOrder(true);
    reset();
    try {
      // Create order from cart
      const createResp = await orderService.createOrderFromCart({ items: items.map(i => ({ productId: i.productId, quantity: i.quantity })) });
      const order = createResp.result as IOrder;
      if (!order?.id) throw new Error('Không tạo được đơn hàng');

      // Checkout (set payment method)
      await orderService.checkoutOrder(order.id, { paymentMethod });

      if (paymentMethod === 'VNPAY') {
        // Request VNPay payment URL
        const action: any = await createPayment({ orderId: order.id, amount: order.total_amount });
        if (action?.payload?.paymentUrl) {
          window.location.href = action.payload.paymentUrl;
        } else if (action?.error) {
          message.error(action.error.message || 'Không thể tạo liên kết VNPay');
        }
      } else {
        message.success('Đặt hàng thành công với phương thức COD');
        navigate(`/account?tab=orders#orders`);
      }
    } catch (e: any) {
      message.error(e?.message || 'Lỗi khi thanh toán');
    } finally {
      setCreatingOrder(false);
    }
  }, [currentUser, items, paymentMethod, navigate, createPayment, reset]);

  if (cartLoading && (!items || items.length === 0)) {
    return <div className="flex justify-center items-center h-96"><Spin size="large" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <Title level={2}>Thanh toán</Title>
      <Space direction="vertical" className="w-full" size="large">
        <Card title="Tóm tắt đơn hàng">
          <Space direction="vertical" className="w-full">
            <Text>Số sản phẩm: <strong>{items.length}</strong></Text>
            <Statistic title="Tổng cộng" value={totalPrice} suffix="₫" valueStyle={{ color: '#cf1322' }} />
          </Space>
        </Card>
        <Card title="Phương thức thanh toán">
          <Radio.Group value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <Space direction="vertical">
              <Radio value="COD">Thanh toán khi nhận hàng (COD)</Radio>
              <Radio value="VNPAY">VNPay</Radio>
            </Space>
          </Radio.Group>
          {error && <Text type="danger" className="block mt-2">{error}</Text>}
        </Card>
        <Button
          type="primary"
          size="large"
          className="!bg-indigo-600"
          loading={creatingOrder || paying}
          disabled={creatingOrder || paying || items.length === 0}
          block
          onClick={handleCheckout}
        >
          Xác nhận & Thanh toán
        </Button>
      </Space>
    </div>
  );
};

export default CheckoutPage;
