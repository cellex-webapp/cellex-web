import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Form, Input, Button, message, Select, Spin, Row, Col, Card, Space, Upload } from 'antd';
import { ShopOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, UploadOutlined, PictureOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { shopService } from '@/services/shop.service';
import { addressService } from '@/services/address.service';
// import { IAddressDataUnit } from '@/types'; // Assuming types are defined

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

  const [provinces, setProvinces] = useState<IAddressDataUnit[]>([]);
  const [communes, setCommunes] = useState<IAddressDataUnit[]>([]);
  
  // Use watch to react to form changes
  const selectedProvince = Form.useWatch('provinceCode', form);

  // --- 1. Helper Functions ---
  
  // Define filterOption inside component or move outside if generic
  const filterOption = (input: string, option: any) => {
    return (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase());
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setCommunes([]); // Clear communes on close
    onClose();
  };

  // --- 2. Data Loading Effects ---

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
            provinceCode: shop.address?.province, 
            communeCode: shop.address?.commune,   
            detailAddress: shop.address?.street,
            phoneNumber: shop.phone_number,
            email: shop.email,
          });

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

  // Load Provinces (Once when modal opens)
  useEffect(() => {
    if (visible && provinces.length === 0) {
      addressService.getProvinces().then((resp: any) => {
          // Handle potential different response structures
          const list = Array.isArray(resp) ? resp : resp.result || [];
          setProvinces(list);
      });
    }
  }, [visible, provinces.length]);

  // Load Communes when Province changes
  useEffect(() => {
    if (!selectedProvince) {
      setCommunes([]);
      return;
    }

    // Only fetch if we have a province code
    addressService.getCommunesByProvinceCode(selectedProvince).then((resp: any) => {
        const list = Array.isArray(resp) ? resp : resp.result || [];
        setCommunes(list);
    });
  }, [selectedProvince]);

  // --- 3. Handlers ---

  const handleProvinceChange = () => {
     // Reset commune when province changes
     form.setFieldValue('communeCode', undefined);
  };

  const handleSubmit = async (values: any) => {
    if (!shopId) return;
    setLoading(true);

    const payload: any = { ...values };
    
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
                    filterOption={filterOption} // Now correctly defined
                  >
                    {provinces.map((p) => (
                      <Select.Option key={p.code} value={p.code}>
                        {p.name}
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
                    filterOption={filterOption} // Now correctly defined
                  >
                    {communes.map((c) => (
                      <Select.Option key={c.code} value={c.code}>
                        {c.name}
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