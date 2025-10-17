import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Card, Row, Col, message, Spin } from 'antd';
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
        // eslint-disable-next-line no-console
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

  const handleFinish = (values: any) => {
    // combine province/commune/detail into addresses string to match IAddAccountPayload
    const provinceName = provinces.find((p) => String(p.code ?? p.provinceCode ?? p.id) === String(values.provinceCode))?.name ?? '';
    const communeName = communes.find((c) => String(c.code ?? c.id) === String(values.communeCode))?.name ?? '';
    const detail = values.detailAddress ?? '';
    const addresses = [provinceName, communeName, detail].filter(Boolean).join(' - ');

    const payload: IAddAccountPayload = {
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      phoneNumber: values.phoneNumber,
      addresses,
    };

    onSubmit(payload);
  };

  const userRoles: UserRole[] = ['ADMIN', 'USER', 'VENDOR'];

  return (
    <>
      <Card>
      <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={initialValues}>
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

        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="role"
              label="Vai trò"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
            >
              <Select placeholder="Chọn vai trò">
                {userRoles.map(role => <Option key={role} value={role} style={{textTransform: 'capitalize'}}>{role}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>
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