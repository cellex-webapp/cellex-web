import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Card, Row, Col, message, Spin, Upload } from 'antd';
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
    const payload: IAddAccountPayload = {
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      phoneNumber: values.phoneNumber,
      provinceCode: values.provinceCode,     
      communeCode: values.communeCode,       
      detailAddress: values.detailAddress,   
      role: 'USER',
    };

    onSubmit(payload);
  };

  return (
    <>
      <Card>
      <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={initialValues}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Ảnh đại diện">
              <Form.Item name="image" valuePropName="file" noStyle>
                <Upload beforeUpload={() => false} onChange={handleUploadChange} maxCount={1} accept="image/*" listType="picture">
                  <Button>Chọn ảnh</Button>
                </Upload>
              </Form.Item>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="fullName"
              label="Họ và Tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: 'Email là bắt buộc!' }, { type: 'email' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: 'Mật khẩu là bắt buộc!' }]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="phoneNumber"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Số điện thoại là bắt buộc!' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item name="provinceCode" label="Tỉnh/Thành">
              {loadingProvinces ? (
                <Spin />
              ) : (
                <Select placeholder="Chọn tỉnh" allowClear onChange={handleProvinceChange}>
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
                placeholder={form.getFieldValue('provinceCode') ? 'Chọn xã/phường' : 'Chọn tỉnh trước'}
                allowClear
                disabled={!form.getFieldValue('provinceCode')}
                notFoundContent={loadingCommunes ? <Spin size="small" /> : 'Chưa có xã/phường'}
              >
                {communes.map((c: any) => (
                  <Option key={c.code ?? c.id} value={c.code ?? c.id}>{c.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="detailAddress" label="Địa chỉ chi tiết">
          <Input.TextArea rows={3} />
        </Form.Item>

      </Form>
      </Card>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
      <Button type="primary" onClick={() => form.submit()} loading={loading}>
        Tạo tài khoản
      </Button>
      </div>
    </>
  );
};

export default UserForm;