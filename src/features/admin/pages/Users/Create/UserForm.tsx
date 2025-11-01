import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Card, Row, Col, message, Spin, Upload } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, PictureOutlined } from '@ant-design/icons';
import { addressService } from '@/services/address.service';

const { Option } = Select;

interface UserFormProps {
  loading: boolean;
  onSubmit: (values: IAddAccountPayload) => void;
  initialValues?: Partial<IAddAccountPayload>;
}

const UserForm: React.FC<UserFormProps> = ({ loading, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState<Array<any>>([]);
  const [communes, setCommunes] = useState<Array<any>>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const resp: any = await addressService.getProvinces();
        const list = Array.isArray(resp) ? resp : resp.result ?? resp;
        setProvinces(list || []);
      } catch (err: any) {
        console.error('Failed to load provinces', err);
        message.error('Không tải được danh sách tỉnh/thành');
      } finally {
        setLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  const handleProvinceChange = async (value: number | string) => {
    if (!value) {
      setCommunes([]);
      form.setFieldsValue({ communeCode: undefined });
      return;
    }
    try {
      setLoadingCommunes(true);
      const resp: any = await addressService.getCommunesByProvinceCode(Number(value));
      const list = Array.isArray(resp) ? resp : resp.result ?? resp;
      setCommunes(list || []);
    } catch (err: any) {
      message.error('Không tải được danh sách xã/phường');
    } finally {
      setLoadingCommunes(false);
    }
  };

  const handleUploadChange = (info: any) => {
    if (info && Array.isArray(info.fileList) && info.fileList.length === 0) {
      form.setFieldsValue({ image: null });
      return;
    }

    const file = info?.file?.originFileObj || info?.file;
    if (file) {
      form.setFieldsValue({ image: file });
    }
  };

  const handleFinish = (values: any) => {
    const payload: IAddAccountPayload & { image?: File } = {
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      phoneNumber: values.phoneNumber,
      provinceCode: values.provinceCode,     
      communeCode: values.communeCode,       
      detailAddress: values.detailAddress,   
      role: values.role || 'USER',
    };

    // Attach image file if exists
    if (values.image) {
      (payload as any).image = values.image;
    }

    onSubmit(payload as IAddAccountPayload);
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
                  <div>
                    <PictureOutlined style={{ fontSize: 24 }} />
                    <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                  </div>
                </Upload>
              </Form.Item>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="fullName"
              label={<span><UserOutlined /> Họ và Tên</span>}
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
            >
              <Input placeholder="Nguyễn Văn A" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="email"
              label={<span><MailOutlined /> Email</span>}
              rules={[{ required: true, message: 'Email là bắt buộc!' }, { type: 'email' }]}
            >
              <Input placeholder="example@email.com" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="password"
              label={<span><LockOutlined /> Mật khẩu</span>}
              rules={[{ required: true, message: 'Mật khẩu là bắt buộc!' }, { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}
            >
              <Input.Password placeholder="••••••" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="phoneNumber"
              label={<span><PhoneOutlined /> Số điện thoại</span>}
              rules={[{ required: true, message: 'Số điện thoại là bắt buộc!' }]}
            >
              <Input placeholder="0912345678" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="role"
              label="Vai trò"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
            >
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
              {loadingProvinces ? (
                <Spin />
              ) : (
                <Select placeholder="Chọn tỉnh/thành phố" allowClear onChange={handleProvinceChange}>
                  {provinces.map((p: any) => (
                    <Option key={p.code ?? p.id} value={p.code ?? p.provinceCode ?? p.id}>{p.name}</Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={12}>
            <Form.Item name="communeCode" label="Quận/Huyện / Xã/Phường">
              <Select
                placeholder={form.getFieldValue('provinceCode') ? 'Chọn quận/huyện' : 'Chọn tỉnh trước'}
                allowClear
                disabled={!form.getFieldValue('provinceCode')}
                notFoundContent={loadingCommunes ? <Spin size="small" /> : 'Chưa có dữ liệu'}
              >
                {communes.map((c: any) => (
                  <Option key={c.code ?? c.id} value={c.code ?? c.id}>{c.name}</Option>
                ))}
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
      <Button onClick={() => form.resetFields()}>
        Đặt lại
      </Button>
      <Button type="primary" onClick={() => form.submit()} loading={loading} className="!bg-indigo-600">
        Tạo tài khoản
      </Button>
      </div>
    </>
  );
};

export default UserForm;