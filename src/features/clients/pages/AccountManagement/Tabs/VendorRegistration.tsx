import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Typography, message, theme, Row, Col, Image, Space } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import useShop from '@/hooks/useShop';
import { useAuth } from '@/hooks/useAuth';

const { Title } = Typography;

const VendorRegistration: React.FC = () => {
  const [form] = Form.useForm();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { createShop, isLoading, error } = useShop();
  const { currentUser } = useAuth();
  const { token } = theme.useToken();

  const onFinish = async (values: any) => {
    const payload: ICreateUpdateShopPayload = {
      shopName: values.shopName,
      description: values.description,
      address: values.address,
      phoneNumber: values.phoneNumber,
      email: values.email,
      logo: logoFile || undefined,
    };

    try {
      await createShop(payload);
      message.success('Đã gửi yêu cầu đăng ký cửa hàng.');
      form.resetFields();
      setLogoFile(null);
    } catch (err) {
      console.error(err);
      message.error('Đăng ký thất bại.');
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
        style={{ width: '100%', maxWidth: 820 }}
      >
        <Row gutter={20}>
          <Col xs={24} lg={16}>
            <Form.Item name="shopName" label="Tên cửa hàng" rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng' }]}>
              <Input placeholder="Ví dụ: Cửa hàng ABC" />
            </Form.Item>

            <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
              <Input.TextArea rows={4} placeholder="Mô tả ngắn về cửa hàng" />
            </Form.Item>

            <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
              <Input placeholder="Số nhà, đường, phường, quận" />
            </Form.Item>

            <Row gutter={12}>
              <Col xs={24} md={12}>
                <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                  <Input placeholder="Điện thoại liên hệ" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="email" label="Email liên hệ" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
                  <Input placeholder="Email liên hệ" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={isLoading} size="large" className='!bg-indigo-600'>
                  Gửi yêu cầu đăng ký
                </Button>
                <Button onClick={() => { form.resetFields(); setLogoFile(null); }} disabled={isLoading}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>

            {error && <div className="text-red-500">{error}</div>}
          </Col>

          <Col xs={24} lg={8}>
            <div style={{ borderRadius: 8, border: '1px dashed #e6e6e6', padding: 12, textAlign: 'center' }}>
              <div style={{ marginBottom: 8, fontWeight: 600 }}>Logo cửa hàng</div>
              {logoPreview ? (
                <div style={{ marginBottom: 12 }}>
                  <Image src={logoPreview} alt="logo preview" width={120} height={120} style={{ objectFit: 'cover', borderRadius: 8 }} />
                </div>
              ) : (
                <div style={{ color: '#888', marginBottom: 12 }}>Chưa có logo</div>
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
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default VendorRegistration;
