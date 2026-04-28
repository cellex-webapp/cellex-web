import React, { useCallback, useEffect, useState } from 'react';
import { Card, Radio, Typography, Button, Space, message, Spin, Statistic, Alert } from 'antd';
import { EnvironmentOutlined, EditOutlined } from '@ant-design/icons';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';
import useVnpay from '@/hooks/useVnpay';
import { useAuth } from '@/hooks/useAuth';
import orderService from '@/services/order.service';
import { AddressSelector, DualAddressDisplay } from '@/components/address';
import type { AddressSelectorValue } from '@/components/address';

const { Title, Text } = Typography;

const CheckoutPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { items, totalPrice, fetchMyCart, isLoading: cartLoading } = useCart();
  const { createPayment, isLoading: paying, error, reset } = useVnpay();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Address states
  const [useExistingAddress, setUseExistingAddress] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<AddressSelectorValue>({
    newWardCode: '',
    detailAddress: '',
  });

  useEffect(() => {
    if (currentUser) {
      fetchMyCart();
      // Check if user has address
      if (!currentUser.address?.commune && !currentUser.address?.street) {
        setUseExistingAddress(false);
        setShowAddressForm(true);
      }
    }
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

    // Validate address
    if (!useExistingAddress) {
      if (!newAddress.newWardCode) {
        message.warning('Vui lòng chọn địa chỉ phường/xã');
        return;
      }
      if (!newAddress.detailAddress?.trim()) {
        message.warning('Vui lòng nhập địa chỉ chi tiết');
        return;
      }
    } else {
      if (!currentUser.address?.commune && !currentUser.address?.street) {
        message.warning('Vui lòng thêm địa chỉ giao hàng');
        setUseExistingAddress(false);
        setShowAddressForm(true);
        return;
      }
    }

    setCreatingOrder(true);
    reset();
    try {
      // Create order from cart
      const createResp = await orderService.createOrderFromCart({ 
        items: items.map((i) => ({ productId: i.productId, skuId: i.skuId, quantity: i.quantity })),
      });
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
  }, [currentUser, items, paymentMethod, navigate, createPayment, reset, useExistingAddress, newAddress]);

  if (cartLoading && (!items || items.length === 0)) {
    return <div className="flex justify-center items-center h-96"><Spin size="large" /></div>;
  }

  const hasExistingAddress = currentUser?.address?.commune || currentUser?.address?.street;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <Title level={2}>Thanh toán</Title>
      <Space direction="vertical" className="w-full" size="large">
        {/* Order Summary */}
        <Card title="Tóm tắt đơn hàng">
          <Space direction="vertical" className="w-full">
            <Text>Số sản phẩm: <strong>{items.length}</strong></Text>
            <Statistic title="Tổng cộng" value={totalPrice} suffix="₫" valueStyle={{ color: '#cf1322' }} />
          </Space>
        </Card>

        {/* Shipping Address */}
        <Card 
          title={
            <Space>
              <EnvironmentOutlined className="text-green-500" />
              <span>Địa chỉ giao hàng</span>
            </Space>
          }
          extra={
            hasExistingAddress && !showAddressForm && (
              <Button 
                type="link" 
                icon={<EditOutlined />}
                onClick={() => {
                  setShowAddressForm(true);
                  setUseExistingAddress(false);
                }}
              >
                Sử dụng địa chỉ khác
              </Button>
            )
          }
        >
          {hasExistingAddress && !showAddressForm ? (
            <div>
              <Radio.Group 
                value={useExistingAddress ? 'existing' : 'new'} 
                onChange={(e) => {
                  setUseExistingAddress(e.target.value === 'existing');
                  if (e.target.value === 'new') {
                    setShowAddressForm(true);
                  }
                }}
              >
                <Radio value="existing">
                  <div className="ml-2">
                    <Text strong>Địa chỉ đã lưu</Text>
                    <div className="text-gray-600 mt-1">
                      {currentUser?.address?.street && `${currentUser.address.street}, `}
                      {currentUser?.address?.commune && `${currentUser.address.commune}, `}
                      {currentUser?.address?.province}
                    </div>
                    {/* Dual address display if we have ward code */}
                    {currentUser?.address && (
                      <div className="mt-2">
                        <DualAddressDisplay 
                          newWardCode={currentUser.address.commune || ''} 
                          detailAddress={currentUser.address.street || ''} 
                          compact={true}
                        />
                      </div>
                    )}
                  </div>
                </Radio>
              </Radio.Group>
            </div>
          ) : (
            <div>
              {hasExistingAddress && (
                <div className="mb-4">
                  <Button 
                    type="link" 
                    className="p-0"
                    onClick={() => {
                      setShowAddressForm(false);
                      setUseExistingAddress(true);
                    }}
                  >
                    ← Sử dụng địa chỉ đã lưu
                  </Button>
                </div>
              )}
              
              {!hasExistingAddress && (
                <Alert
                  type="info"
                  showIcon
                  message="Bạn chưa có địa chỉ giao hàng"
                  description="Vui lòng nhập địa chỉ giao hàng để tiếp tục thanh toán."
                  className="mb-4"
                />
              )}
              
              <AddressSelector
                value={newAddress}
                onChange={setNewAddress}
                required={true}
                showModeSelector={true}
                defaultMode="new"
                layout="vertical"
                size="middle"
              />
            </div>
          )}
        </Card>

        {/* Payment Method */}
        <Card title="Phương thức thanh toán">
          <Radio.Group value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <Space direction="vertical">
              <Radio value="COD">Thanh toán khi nhận hàng (COD)</Radio>
              <Radio value="VNPAY">VNPay</Radio>
            </Space>
          </Radio.Group>
          {error && <Text type="danger" className="block mt-2">{error}</Text>}
        </Card>

        {/* Checkout Button */}
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
