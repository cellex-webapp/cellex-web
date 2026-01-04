import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Typography, message, theme, Row, Col, Image, Space, Card } from 'antd';
import { UploadOutlined, DeleteOutlined, ShopOutlined, EnvironmentOutlined } from '@ant-design/icons';
import useShop from '@/hooks/useShop';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AddressSelector } from '@/components/address';
import type { AddressSelectorValue } from '@/components/address';

const { Title } = Typography;

const VendorRegistration: React.FC = () => {
  const [form] = Form.useForm();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { createShop, isLoading, error } = useShop();
  const { currentUser } = useAuth();
  const { token } = theme.useToken();
  const navigate = useNavigate();

  // Address state using new dual system
  const [addressValue, setAddressValue] = useState<AddressSelectorValue>({
    newWardCode: '',
    detailAddress: '',
  });

  const onFinish = async (values: any) => {
    if (!addressValue.newWardCode) {
      message.warning('Vui lòng chọn địa chỉ phường/xã');
      return;
    }
    if (!addressValue.detailAddress?.trim()) {
      message.warning('Vui lòng nhập địa chỉ chi tiết');
      return;
    }

    const payload: ICreateUpdateShopPayload = {
      shopName: values.shopName,
      description: values.description,
      provinceCode: addressValue.newProvinceCode || '',
      communeCode: addressValue.newWardCode,
      detailAddress: addressValue.detailAddress,
      phoneNumber: values.phoneNumber,
      email: values.email,
      logo: logoFile || undefined,
    };

    try {
      await createShop(payload);
      message.success('Đã gửi yêu cầu đăng ký cửa hàng. Vui lòng chờ quản trị viên duyệt.');
      navigate('/account');
      form.resetFields();
      setLogoFile(null);
      setAddressValue({ newWardCode: '', detailAddress: '' });
    } catch (err) {
      console.error(err);
      message.error(error || 'Đăng ký thất bại.');
    }
  };

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  return (
    <div className="flex w-full flex-col items-start px-4 py-2">
      <Title level={4} style={{ marginBottom: token.marginLG }}>Đăng ký làm người bán</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          email: currentUser?.email || undefined,
          phoneNumber: currentUser?.phoneNumber || undefined,
        }}
        style={{ width: '100%', maxWidth: 900 }}
      >
        <Row gutter={20}>
          <Col xs={24} lg={16}>
            {/* Basic Info */}
            <Card 
              size="small" 
              className="mb-4"
              title={
                <Space>
                  <ShopOutlined className="text-blue-500" />
                  <span>Thông tin cửa hàng</span>
                </Space>
              }
            >
              <Form.Item 
                name="shopName" 
                label="Tên cửa hàng" 
                rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng' }]}
              >
                <Input placeholder="Ví dụ: Cửa hàng ABC" />
              </Form.Item>

              <Form.Item name="description" label="Mô tả">
                <Input.TextArea rows={3} placeholder="Mô tả ngắn về cửa hàng" showCount maxLength={500} />
              </Form.Item>
            </Card>

            {/* Address with Dual System */}
            <Card 
              size="small" 
              className="mb-4"
              title={
                <Space>
                  <EnvironmentOutlined className="text-green-500" />
                  <span>Địa chỉ cửa hàng</span>
                </Space>
              }
            >
              <AddressSelector
                value={addressValue}
                onChange={setAddressValue}
                required={true}
                showModeSelector={true}
                defaultMode="new"
                layout="horizontal"
                size="middle"
              />
            </Card>

            {/* Contact Info */}
            <Card 
              size="small" 
              className="mb-4"
              title={
                <Space>
                  <span>📞</span>
                  <span>Thông tin liên hệ</span>
                </Space>
              }
            >
              <Row gutter={12}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="phoneNumber" 
                    label="Số điện thoại cửa hàng" 
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                  >
                    <Input placeholder="Điện thoại liên hệ" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="email" 
                    label="Email cửa hàng" 
                    rules={[
                      { required: true, message: 'Vui lòng nhập email' }, 
                      { type: 'email', message: 'Email không hợp lệ' }
                    ]}
                  >
                    <Input placeholder="Email liên hệ" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={isLoading} size="large" className='!bg-indigo-600'>
                  Gửi yêu cầu đăng ký
                </Button>
                <Button 
                  onClick={() => { 
                    form.resetFields(); 
                    setLogoFile(null); 
                    setAddressValue({ newWardCode: '', detailAddress: '' });
                  }} 
                  disabled={isLoading}
                >
                  Hủy
                </Button>
              </Space>
            </Form.Item>

            {error && <div className="text-red-500">{error}</div>}
          </Col>

          <Col xs={24} lg={8}>
            <Card size="small" title="Logo cửa hàng">
              <div style={{ textAlign: 'center' }}>
                {logoPreview ? (
                  <div style={{ marginBottom: 12 }}>
                    <Image 
                      src={logoPreview} 
                      alt="logo preview" 
                      width={120} 
                      height={120} 
                      style={{ objectFit: 'cover', borderRadius: 8 }} 
                    />
                  </div>
                ) : (
                  <div style={{ color: '#888', marginBottom: 12, padding: '40px 0' }}>
                    Chưa có logo
                  </div>
                )}
                <Upload
                  beforeUpload={(file) => {
                    setLogoFile(file as File);
                    return false;
                  }}
                  maxCount={1}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>Tải lên logo</Button>
                </Upload>
                {logoPreview && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    style={{ marginTop: 12 }}
                    onClick={() => setLogoFile(null)}
                  >
                    Xóa
                  </Button>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default VendorRegistration;