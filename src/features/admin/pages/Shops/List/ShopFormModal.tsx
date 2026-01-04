import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, message, Spin, Row, Col, Card, Space, Upload, Tag } from 'antd';
import { ShopOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, UploadOutlined, PictureOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { shopService } from '@/services/shop.service';
import { AddressSelector } from '@/components/address';
import type { AddressSelectorValue } from '@/components/address';

interface Props {
  visible: boolean;
  shopId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const ShopFormModal: React.FC<Props> = ({ visible, shopId, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Address state using new dual system
  const [addressValue, setAddressValue] = useState<AddressSelectorValue>({
    newWardCode: '',
    detailAddress: '',
  });

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setAddressValue({ newWardCode: '', detailAddress: '' });
    onClose();
  };

  // Load Shop Data
  useEffect(() => {
    if (!visible || !shopId) return;

    const fetchShop = async () => {
      setFetching(true);
      try {
        const resp = await shopService.getShopById(shopId);
        const shop = resp.result;
        
        if (shop) {
          form.setFieldsValue({
            shopName: shop.shop_name,
            description: shop.description,
            phoneNumber: shop.phone_number,
            email: shop.email,
          });

          // Set address from existing shop
          if (shop.address) {
            setAddressValue({
              newWardCode: shop.address.commune_code || '',
              newProvinceCode: shop.address.province_code || '',
              detailAddress: shop.address.street || '',
            });
          }

          if (shop.logo_url) {
            setFileList([{
              uid: '-1',
              name: 'logo.png',
              status: 'done',
              url: shop.logo_url,
            }]);
          }
        }
      } catch (error) {
        message.error('Không thể tải thông tin cửa hàng');
      } finally {
        setFetching(false);
      }
    };

    fetchShop();
  }, [visible, shopId, form]);

  const handleSubmit = async (values: any) => {
    if (!shopId) return;
    
    if (!addressValue.newWardCode) {
      message.warning('Vui lòng chọn địa chỉ phường/xã');
      return;
    }
    if (!addressValue.detailAddress?.trim()) {
      message.warning('Vui lòng nhập địa chỉ chi tiết');
      return;
    }

    setLoading(true);

    const payload: any = {
      shopName: values.shopName,
      description: values.description,
      provinceCode: addressValue.newProvinceCode || '',
      communeCode: addressValue.newWardCode,
      detailAddress: addressValue.detailAddress,
      phoneNumber: values.phoneNumber,
      email: values.email,
    };
    
    // Handle File Upload
    if (fileList.length > 0 && fileList[0].originFileObj) {
      payload.logo = fileList[0].originFileObj;
    }

    try {
      await shopService.updateShop(shopId, payload);
      message.success('Cập nhật cửa hàng thành công');
      onSuccess?.();
      handleCancel();
    } catch (error: any) {
      const errorMsg = error?.message || 'Cập nhật thất bại';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <ShopOutlined className="text-blue-500" />
          <span className="font-semibold">Cập nhật thông tin cửa hàng</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose
      style={{ top: 20 }}
      maskClosable={false}
    >
      {fetching ? (
        <div className="text-center py-12">
          <Spin size="large" tip="Đang tải thông tin..." />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          {/* LOGO UPLOAD */}
          <Card size="small" className="mb-4" title={<Space><PictureOutlined />Logo cửa hàng</Space>}>
            <Form.Item className="mb-0">
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                maxCount={1}
                accept="image/*"
              >
                {fileList.length === 0 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Tải logo</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Card>

          {/* BASIC INFO */}
          <Card size="small" className="mb-4" title={<Space><ShopOutlined />Thông tin cơ bản</Space>}>
            <Form.Item
              label="Tên cửa hàng"
              name="shopName"
              rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng' }]}
            >
              <Input placeholder="Tên cửa hàng" />
            </Form.Item>

            <Form.Item label="Mô tả" name="description" className="mb-0">
              <Input.TextArea
                rows={3}
                placeholder="Mô tả ngắn về cửa hàng"
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Card>

          {/* ADDRESS */}
          <Card 
            size="small" 
            className="mb-4" 
            title={
              <Space>
                <EnvironmentOutlined className="text-green-500" />
                <span>Địa chỉ</span>
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

          {/* CONTACT */}
          <Card size="small" className="mb-4" title={<Space><PhoneOutlined />Thông tin liên hệ</Space>}>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="phoneNumber"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                    { pattern: /^[0-9]{10,11}$/, message: 'SĐT phải có 10-11 chữ số' }
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Nhập email" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ACTIONS */}
          <Form.Item className="mb-0">
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={handleCancel} size="large">
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                Cập nhật
              </Button>
            </div>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default ShopFormModal;