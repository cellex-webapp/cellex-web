import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Card, Row, Col, message, Spin, Upload } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, PictureOutlined } from '@ant-design/icons';
import { addressService } from '@/services/address.service';

const { Option } = Select;

interface IAddressItem {
  code: string | number;
  name: string;
}

interface UserFormProps {
  loading: boolean;
  onSubmit: (values: IAddAccountPayload & { image?: File }) => void; 
  initialValues?: Partial<IAddAccountPayload>;
}

const UserForm: React.FC<UserFormProps> = ({ loading, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState<IAddressItem[]>([]);
  const [communes, setCommunes] = useState<IAddressItem[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const resp = await addressService.getProvinces(); 
        setProvinces(resp.result || []);
      } catch (err) {
        console.error('Failed to load provinces', err);
        message.error('Không tải được danh sách tỉnh/thành');
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  const handleProvinceChange = async (value: string | number) => {
    form.setFieldsValue({ communeCode: undefined });
    setCommunes([]);

    if (!value) return;

    try {
      setLoadingCommunes(true);
      const resp = await addressService.getCommunesByProvinceCode(value.toString());
      setCommunes(resp.result || []);
    } catch (err) {
      message.error('Không tải được danh sách xã/phường');
    } finally {
      setLoadingCommunes(false);
    }
  };

  const handleUploadChange = (info: any) => {
    const file = info.fileList[0]?.originFileObj;
    form.setFieldsValue({ image: file });
  };

  const handleFinish = (values: any) => {
    const payload: IAddAccountPayload & { image?: File } = {
      ...values,
      role: values.role || 'USER',
    };

    if (values.image) {
       payload.image = values.image;
    }

    onSubmit(payload);
  };

  return (
    <>
      <Card>
      <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ role: 'USER', ...initialValues }}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label={<span><PictureOutlined /> Ảnh đại diện</span>}>
              <Form.Item name="image" valuePropName="file" noStyle>
                <Upload 
                  beforeUpload={() => false} 
                  onChange={handleUploadChange} 
                  maxCount={1} 
                  accept="image/*" 
                  listType="picture-card"
                >
                  <div><PictureOutlined style={{ fontSize: 24 }} /> <div style={{ marginTop: 8 }}>Chọn ảnh</div></div>
                </Upload>
              </Form.Item>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}><Form.Item name="fullName" label={<span><UserOutlined /> Họ và Tên</span>} rules={[{ required: true }]}><Input placeholder="Nguyễn Văn A" /></Form.Item></Col>
          <Col xs={24} sm={24} md={12}><Form.Item name="email" label={<span><MailOutlined /> Email</span>} rules={[{ required: true }, { type: 'email' }]}><Input placeholder="example@email.com" /></Form.Item></Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}><Form.Item name="password" label={<span><LockOutlined /> Mật khẩu</span>} rules={[{ required: true }, { min: 6 }]}><Input.Password placeholder="••••••" /></Form.Item></Col>
          <Col xs={24} sm={24} md={12}><Form.Item name="phoneNumber" label={<span><PhoneOutlined /> Số điện thoại</span>} rules={[{ required: true }]}><Input placeholder="0912345678" /></Form.Item></Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
              <Select placeholder="Chọn vai trò">
                <Option value="USER">User (Khách hàng)</Option>
                <Option value="VENDOR">Vendor (Nhà bán hàng)</Option>
                <Option value="ADMIN">Admin (Quản trị viên)</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item name="provinceCode" label="Tỉnh/Thành">
              <Select placeholder="Chọn tỉnh/thành phố" allowClear onChange={handleProvinceChange} loading={loadingProvinces}>
                {provinces.map((p) => (<Option key={p.code} value={p.code}>{p.name}</Option>))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={12}>
            <Form.Item name="communeCode" label="Quận/Huyện / Xã/Phường">
              <Select
                placeholder={form.getFieldValue('provinceCode') ? 'Chọn quận/huyện' : 'Chọn tỉnh trước'}
                allowClear
                disabled={!form.getFieldValue('provinceCode')}
                loading={loadingCommunes}
              >
                {communes.map((c) => (<Option key={c.code} value={c.code}>{c.name}</Option>))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="detailAddress" label="Địa chỉ chi tiết">
          <Input.TextArea rows={3} placeholder="Số nhà, tên đường, tòa nhà..." />
        </Form.Item>

      </Form>
      </Card>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
        <Button onClick={() => form.resetFields()}>Đặt lại</Button>
        <Button type="primary" onClick={() => form.submit()} loading={loading} className="!bg-indigo-600">Tạo tài khoản</Button>
      </div>
    </>
  );
};

export default UserForm;