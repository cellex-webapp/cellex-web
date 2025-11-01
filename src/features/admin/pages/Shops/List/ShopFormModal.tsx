import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Upload, Button, message, Select, Spin, Row, Col, Card, Space } from 'antd';
import { 
  UploadOutlined, 
  ShopOutlined, 
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  PictureOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { shopService } from '@/services/shop.service';
import { addressService } from '@/services/address.service';

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
  const [provinces, setProvinces] = useState<string[]>([]);
  const [communes, setCommunes] = useState<string[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>();

  // Fetch shop data
  useEffect(() => {
    if (!visible || !shopId) return;
    
    setFetching(true);
    shopService
      .getShopById(shopId)
      .then((resp: any) => {
        const shop = resp.result;
        if (shop) {
          form.setFieldsValue({
            shopName: shop.shop_name,
            description: shop.description,
            provinceCode: shop.address?.province_code,
            communeCode: shop.address?.commune_code,
            detailAddress: shop.address?.detail_address,
            phoneNumber: shop.phone_number,
            email: shop.email,
          });
          
          // Set logo if exists
          if (shop.logo_url) {
            setFileList([
              {
                uid: '-1',
                name: 'logo.png',
                status: 'done',
                url: shop.logo_url,
              },
            ]);
          }
          
          // Set selected province for commune loading
          if (shop.address?.province_code) {
            setSelectedProvince(shop.address.province_code);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to fetch shop', err);
        message.error('Không thể tải thông tin cửa hàng');
      })
      .finally(() => {
        setFetching(false);
      });
  }, [visible, shopId, form]);

  // Fetch provinces
  useEffect(() => {
    if (!visible) return;
    
    addressService
      .getProvinces()
      .then((resp: any) => {
        setProvinces(resp.result || []);
      })
      .catch((err) => {
        console.error('Failed to fetch provinces', err);
      });
  }, [visible]);

  // Fetch communes when province changes
  useEffect(() => {
    if (!selectedProvince) {
      setCommunes([]);
      return;
    }
    
    addressService
      .getCommunesByProvinceCode(Number(selectedProvince))
      .then((resp: any) => {
        setCommunes(resp.result || []);
      })
      .catch((err: any) => {
        console.error('Failed to fetch communes', err);
      });
  }, [selectedProvince]);

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    form.setFieldValue('communeCode', undefined);
  };

  const handleSubmit = async (values: any) => {
    if (!shopId) return;
    
    setLoading(true);
    const formData = new FormData();
    
    formData.append('shopName', values.shopName);
    formData.append('description', values.description || '');
    formData.append('provinceCode', values.provinceCode);
    formData.append('communeCode', values.communeCode);
    formData.append('detailAddress', values.detailAddress);
    formData.append('phoneNumber', values.phoneNumber);
    formData.append('email', values.email);
    
    // Attach logo file if changed
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('logo', fileList[0].originFileObj);
    }
    
    try {
      await shopService.updateShop(shopId, formData as any);
      message.success('Cập nhật cửa hàng thành công');
      onSuccess?.();
      onClose();
      form.resetFields();
      setFileList([]);
    } catch (error: any) {
      console.error('Failed to update shop', error);
      const errorMsg = error?.response?.data?.message || 'Cập nhật cửa hàng thất bại';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setSelectedProvince(undefined);
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <ShopOutlined style={{ fontSize: 18, color: '#1890ff' }} />
          <span className="font-semibold">Cập nhật thông tin cửa hàng</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      style={{ top: 20 }}
      destroyOnClose
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
          {/* Logo Section */}
          <Card size="small" className="mb-4" title={<Space><PictureOutlined />Logo cửa hàng</Space>}>
            <Form.Item className="mb-0">
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                maxCount={1}
              >
                {fileList.length === 0 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Card>

          {/* Basic Info */}
          <Card size="small" className="mb-4" title={<Space><ShopOutlined />Thông tin cơ bản</Space>}>
            <Form.Item
              label="Tên cửa hàng"
              name="shopName"
              rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng' }]}
            >
              <Input placeholder="Nhập tên cửa hàng" />
            </Form.Item>

            <Form.Item
              label="Mô tả cửa hàng"
              name="description"
              className="mb-0"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Nhập mô tả về cửa hàng của bạn..."
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Card>

          {/* Address Info */}
          <Card size="small" className="mb-4" title={<Space><EnvironmentOutlined />Địa chỉ</Space>}>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  label="Tỉnh/Thành phố"
                  name="provinceCode"
                  rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
                >
                  <Select
                    placeholder="Chọn tỉnh/thành phố"
                    onChange={handleProvinceChange}
                    showSearch
                    optionFilterProp="children"
                  >
                    {provinces.map((p) => (
                      <Select.Option key={p} value={p}>
                        {p}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Xã/Phường/Thị trấn"
                  name="communeCode"
                  rules={[{ required: true, message: 'Vui lòng chọn xã/phường' }]}
                >
                  <Select
                    placeholder="Chọn xã/phường/thị trấn"
                    disabled={!selectedProvince}
                    showSearch
                    optionFilterProp="children"
                  >
                    {communes.map((c) => (
                      <Select.Option key={c} value={c}>
                        {c}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Địa chỉ chi tiết"
              name="detailAddress"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
              className="mb-0"
            >
              <Input 
                prefix={<EnvironmentOutlined />}
                placeholder="Số nhà, tên đường... (VD: 118 Đường B)" 
              />
            </Form.Item>
          </Card>

          {/* Contact Info */}
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

          {/* Action Buttons */}
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