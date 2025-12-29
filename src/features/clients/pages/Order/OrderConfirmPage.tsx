import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, List, Row, Col, Statistic, Space, Radio, Button, Tag, message, Divider, Form, Input, Select, Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import { fetchOrderById, fetchAvailableCoupons, applyCouponToOrder, removeCouponFromOrder, checkoutOrder } from '@/stores/slices/order.slice';
import { selectSelectedOrder, selectAvailableCoupons, selectOrderLoading, selectOrderError, selectOrderPaymentUrl } from '@/stores/selectors/order.selector';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/redux';
import { updateUserProfile } from '@/stores/slices/user.slice';
import { addressService } from '@/services/address.service';

const { Title, Text } = Typography;

// Page responsibilities:
// 1. Load order by id (created previously from product or cart)
// 2. Fetch available coupons and allow applying exactly one coupon
// 3. Allow removing coupon and applying a different one
// 4. Select payment method and trigger checkout
// 5. If checkout response contains paymentUrl -> redirect to VNPay
// 6. Otherwise show success and navigate to orders list

const OrderConfirmPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const appDispatch = useAppDispatch();
  const { currentUser } = useAuth();

  const order = useSelector(selectSelectedOrder);
  const coupons = useSelector(selectAvailableCoupons);
  const isLoading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);
  const paymentUrl = useSelector(selectOrderPaymentUrl);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const COUNTDOWN_SECONDS = 6;

  // Address management state
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [addressForm] = Form.useForm();
  const [provinces, setProvinces] = useState<IAddressDataUnit[]>([]);
  const [communes, setCommunes] = useState<IAddressDataUnit[]>([]);
  const [provinceSelected, setProvinceSelected] = useState<string | undefined>(undefined);
  const [addressLoading, setAddressLoading] = useState(false);

  // Load address data from user
  const getUserAddress = useCallback(() => {
    const anyUser: any = currentUser as any;
    if (!anyUser) return null;

    const provinceCode = anyUser.provinceCode ?? anyUser.province_code ?? undefined;
    const communeCode = anyUser.communeCode ?? anyUser.commune_code ?? undefined;
    const detailAddress = anyUser.detailAddress ?? anyUser.detail_address ?? anyUser.address?.detailAddress ?? anyUser.address?.street;
    const provinceName = anyUser.address?.province;
    const communeName = anyUser.address?.commune;

    return {
      provinceCode,
      communeCode,
      detailAddress,
      provinceName: provinceName ?? provinces.find(p => p.code === String(provinceCode))?.name,
      communeName: communeName ?? communes.find(c => c.code === String(communeCode))?.name,
      fullAddress: anyUser.address?.fullAddress ?? [detailAddress, communeName ?? communes.find(c => c.code === String(communeCode))?.name, provinceName ?? provinces.find(p => p.code === String(provinceCode))?.name].filter(Boolean).join(', ')
    };
  }, [currentUser, provinces, communes]);

  // Load provinces on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const resp = await addressService.getProvinces();
        if (mounted) setProvinces(resp.result || []);
      } catch (err) {
        console.error('Failed to load provinces', err);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Load communes when province selected
  useEffect(() => {
    if (!provinceSelected) {
      setCommunes([]);
      return;
    }

    let mounted = true;
    const load = async () => {
      try {
        const resp = await addressService.getCommunesByProvinceCode(provinceSelected);
        if (mounted) setCommunes(resp.result || []);
      } catch (err) {
        console.error('Failed to load communes', err);
        if (mounted) setCommunes([]);
      }
    };
    load();
    return () => { mounted = false; };
  }, [provinceSelected]);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
      dispatch(fetchAvailableCoupons(orderId));
    }
  }, [orderId, dispatch]);

  const handleApplyCoupon = useCallback(async (code: string) => {
    if (!orderId) return;
    try {
      await dispatch(applyCouponToOrder({ orderId, body: { code } })).unwrap();
      message.success('Áp mã thành công');
    } catch (e: any) {
      message.error(e?.message || 'Không áp được mã');
    }
  }, [dispatch, orderId]);

  const handleRemoveCoupon = useCallback(async () => {
    if (!orderId) return;
    try {
      await dispatch(removeCouponFromOrder(orderId)).unwrap();
      message.success('Đã gỡ mã giảm giá');
    } catch (e: any) {
      message.error(e?.message || 'Không gỡ được mã');
    }
  }, [dispatch, orderId]);

  // Handle address update
  const handleOpenAddressModal = () => {
    const address = getUserAddress();
    if (address) {
      addressForm.setFieldsValue({
        provinceCode: address.provinceCode,
        communeCode: address.communeCode,
        detailAddress: address.detailAddress
      });
      setProvinceSelected(address.provinceCode);
    }
    setIsAddressModalVisible(true);
  };

  const handleAddressUpdate = async (values: any) => {
    setAddressLoading(true);
    try {
      const anyUser: any = currentUser as any;
      const payload: IUpdateProfilePayload = {
        fullName: anyUser?.fullName ?? undefined,
        phoneNumber: anyUser?.phoneNumber ?? undefined,
        provinceCode: values.provinceCode || undefined,
        communeCode: values.communeCode || undefined,
        detailAddress: values.detailAddress || undefined,
      };

      const res: any = await appDispatch(updateUserProfile(payload));
      if (res?.error) {
        throw new Error(res.error?.message ?? 'Cập nhật thất bại');
      }

      message.success('Cập nhật địa chỉ nhận hàng thành công');
      setIsAddressModalVisible(false);

      // Update localStorage
      try {
        const provinceName = provinces.find(p => p.code === payload.provinceCode)?.name;
        const communeName = communes.find(c => c.code === payload.communeCode)?.name;
        const address = {
          provinceCode: payload.provinceCode,
          communeCode: payload.communeCode,
          detailAddress: payload.detailAddress,
          street: payload.detailAddress,
          province: provinceName,
          commune: communeName,
          fullAddress: [payload.detailAddress, communeName, provinceName].filter(Boolean).join(', '),
        };

        const raw = localStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw);
          u.address = address;
          u.provinceCode = payload.provinceCode;
          u.communeCode = payload.communeCode;
          u.detailAddress = payload.detailAddress;
          localStorage.setItem('user', JSON.stringify(u));
        }
      } catch { /* ignore */ }
    } catch (err: any) {
      message.error(err?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setAddressLoading(false);
    }
  };

  // Load stored paymentUrl (in case of refresh) if state empty and paymentMethod already VNPAY
  useEffect(() => {
    if (paymentMethod === 'VNPAY' && !paymentUrl) {
      const stored = localStorage.getItem('pendingVnpayPaymentUrl');
      if (stored) {
        message.info('Khôi phục phiên thanh toán VNPay trước đó');
        // We cannot set paymentUrl directly (in slice) here; advise user to nhấn nút chuyển hướng.
      }
    }
  }, [paymentMethod, paymentUrl]);

  const handleCheckout = useCallback(async () => {
    if (!orderId) return;
    setSubmitting(true);
    try {
      const action = await dispatch(checkoutOrder({ orderId, body: { paymentMethod } })).unwrap();
      if (paymentMethod === 'VNPAY' && (action.paymentUrl || paymentUrl)) {
        const target = action.paymentUrl || paymentUrl!;
        localStorage.setItem('pendingVnpayPaymentUrl', target);
        message.success('Tạo liên kết VNPay thành công – sẽ chuyển hướng sau vài giây');
        setCountdown(COUNTDOWN_SECONDS);
        return;
      }
      message.success('Đặt hàng thành công');
      navigate('/account?tab=orders#orders');
    } catch (e: any) {
      message.error(e?.message || 'Thanh toán thất bại');
    } finally {
      setSubmitting(false);
    }
  }, [dispatch, orderId, paymentMethod, navigate]);

  // Countdown effect for VNPay auto redirect
  useEffect(() => {
    if (countdown == null) return;
    if (countdown <= 0) {
      const target = paymentUrl || localStorage.getItem('pendingVnpayPaymentUrl');
      if (paymentMethod === 'VNPAY' && target) {
        window.location.href = target;
      }
      return;
    }
    const timer = setTimeout(() => setCountdown(prev => (prev != null ? prev - 1 : null)), 1000);
    return () => clearTimeout(timer);
  }, [countdown, paymentMethod, paymentUrl]);

  if (isLoading && !order) {
    return <div className="flex items-center justify-center h-96"><Spin size="large" /></div>;
  }

  if (!order) {
    return <div className="p-8 text-center"><Title level={4}>Không tìm thấy đơn hàng</Title></div>;
  }

  const totalBefore = order.subtotal;
  const discount = order.discount_amount;
  const totalAfter = order.total_amount;
  const userAddress = getUserAddress();

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <Title level={2}>Xác nhận đơn hàng</Title>
      <Space direction="vertical" size="large" className="w-full">
        {/* Shipping Address Card */}
        <Card 
          title="Địa chỉ nhận hàng" 
          bordered
          extra={
            <Button type="link" onClick={handleOpenAddressModal}>
              {userAddress?.detailAddress ? 'Thay đổi' : 'Thêm địa chỉ'}
            </Button>
          }
        >
          {userAddress?.detailAddress ? (
            <Space direction="vertical" size="small" className="w-full">
              <div>
                <Text strong>{(currentUser as any)?.fullName ?? 'Khách hàng'}</Text>
                <Divider type="vertical" />
                <Text>{(currentUser as any)?.phoneNumber ?? (currentUser as any)?.phone_number ?? ''}</Text>
              </div>
              <Text>{userAddress.fullAddress}</Text>
            </Space>
          ) : (
            <Text type="warning">Chưa có địa chỉ nhận hàng. Vui lòng thêm địa chỉ để tiếp tục.</Text>
          )}
        </Card>

        <Card title="Sản phẩm" bordered>
          <List
            dataSource={order.items}
            renderItem={(item) => (
              <List.Item>
                <Row className="w-full" gutter={12}>
                  <Col flex={1}><Text strong>{item.product_name}</Text></Col>
                  <Col span={4}><Text>x {item.quantity}</Text></Col>
                  <Col span={6} className="text-right">
                    <Text>{item.subtotal.toLocaleString('vi-VN')} ₫</Text>
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </Card>

        <Card title="Mã giảm giá" bordered extra={order.coupon_code ? <Button danger size="small" onClick={handleRemoveCoupon}>Gỡ mã</Button> : null}>
          {order.coupon_code ? (
            <Tag color="green">Đã áp: {order.coupon_code}</Tag>
          ) : (
            <List
              dataSource={coupons}
              locale={{ emptyText: 'Không có mã khả dụng' }}
              renderItem={(c) => (
                <List.Item
                  actions={[<Button key="apply" type="link" onClick={() => handleApplyCoupon(c.code)}>Áp</Button>]}
                >
                  <Space direction="vertical" size={0}>
                    <Text strong>{c.code}</Text>
                    {c.title && <Text type="secondary">{c.title}</Text>}
                    {c.description && <Text type="secondary" className="text-xs">{c.description}</Text>}
                    {c.expiresAt && <Text type="secondary" className="text-xs">Hết hạn: {new Date(c.expiresAt).toLocaleDateString()}</Text>}
                  </Space>
                </List.Item>
              )}
            />
          )}
        </Card>

        <Card title="Thanh toán" bordered>
          <Space direction="vertical" className="w-full" size="middle">
            <Radio.Group value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <Space direction="vertical">
                <Radio value="COD">Thanh toán khi nhận hàng (COD)</Radio>
                <Radio value="VNPAY">VNPay</Radio>
              </Space>
            </Radio.Group>
            <Divider className="my-2" />
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="Tạm tính" value={totalBefore} suffix="₫" valueStyle={{ fontSize: 18 }} />
              </Col>
              <Col span={8}>
                <Statistic title="Giảm" value={discount} suffix="₫" valueStyle={{ fontSize: 18, color: '#3f8600' }} />
              </Col>
              <Col span={8}>
                <Statistic title="Tổng cộng" value={totalAfter} suffix="₫" valueStyle={{ fontSize: 22, color: '#cf1322' }} />
              </Col>
            </Row>
            {error && <Text type="danger">{error}</Text>}
            {paymentMethod === 'VNPAY' && (paymentUrl || localStorage.getItem('pendingVnpayPaymentUrl')) && (
              <Space direction="vertical" className="w-full">
                {countdown != null ? (
                  <Card size="small" className="bg-indigo-50" bordered={false}>
                    <Space direction="vertical" size={4}>
                      <Text>Chuẩn bị chuyển hướng đến cổng VNPay sau <Text strong>{countdown}s</Text>.</Text>
                      <Space>
                        {/* <Button type="primary" className="!bg-indigo-600" size="small" onClick={manualRedirect}>Chuyển ngay</Button>
                        <Button size="small" onClick={cancelCountdown}>Hủy tự động</Button> */}
                      </Space>
                    </Space>
                  </Card>
                ) : (
                  <Space>
                    {/* <Button type="default" onClick={manualRedirect}>Đi tới cổng VNPay</Button>
                    <Button type="dashed" onClick={() => setCountdown(COUNTDOWN_SECONDS)}>Bắt đầu đếm ngược</Button> */}
                  </Space>
                )}
              </Space>
            )}
            <Button
              type="primary"
              className="!bg-indigo-600"
              size="large"
              block
              loading={submitting}
              onClick={handleCheckout}
              disabled={!userAddress?.detailAddress}
            >
              Xác nhận & Thanh toán
            </Button>
            {!userAddress?.detailAddress && (
              <Text type="danger" className="text-center block">
                Vui lòng thêm địa chỉ nhận hàng để tiếp tục
              </Text>
            )}
          </Space>
        </Card>
      </Space>

      {/* Address Edit Modal */}
      <Modal
        title="Cập nhật địa chỉ nhận hàng"
        open={isAddressModalVisible}
        onCancel={() => setIsAddressModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form 
          form={addressForm} 
          layout="vertical" 
          onFinish={handleAddressUpdate}
        >
          <Form.Item 
            label="Tỉnh/Thành" 
            name="provinceCode"
            rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành' }]}
          >
            <Select
              showSearch
              placeholder="Chọn tỉnh/thành"
              optionFilterProp="label"
              onChange={(value) => {
                setProvinceSelected(value);
                addressForm.setFieldsValue({ communeCode: undefined });
              }}
              options={provinces.map((p) => ({
                value: p.code,
                label: p.name,
              }))}
            />
          </Form.Item>

          <Form.Item 
            label="Phường/Xã" 
            name="communeCode"
            rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
          >
            <Select
              showSearch
              placeholder="Chọn phường/xã"
              disabled={!provinceSelected}
              optionFilterProp="label"
              options={communes.map((c) => ({
                value: c.code,
                label: c.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Địa chỉ chi tiết"
            name="detailAddress"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
          >
            <Input.TextArea rows={3} placeholder="Số nhà, tên đường..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                className="!bg-indigo-600" 
                type="primary" 
                htmlType="submit" 
                loading={addressLoading}
              >
                Lưu địa chỉ
              </Button>
              <Button onClick={() => setIsAddressModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderConfirmPage;
