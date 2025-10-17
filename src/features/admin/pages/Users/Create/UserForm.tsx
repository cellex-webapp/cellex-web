import React from 'react';
import { Form, Input, Button, Select, Card } from 'antd';

const { Option } = Select;

interface UserFormProps {
  loading: boolean;
  onSubmit: (values: IAddAccountPayload) => void;
  initialValues?: Partial<IAddAccountPayload>;
}

const UserForm: React.FC<UserFormProps> = ({ loading, onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  const handleFinish = (values: IAddAccountPayload) => {
    onSubmit(values);
  };

  const userRoles: UserRole[] = ['ADMIN', 'USER', 'VENDOR'];

  return (
    <Card>
      <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={initialValues}>
        <Form.Item
          name="fullName"
          label="Họ và Tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: 'Email là bắt buộc!' }, { type: 'email' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[{ required: true, message: 'Mật khẩu là bắt buộc!' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="phoneNumber"
          label="Số điện thoại"
          rules={[{ required: true, message: 'Số điện thoại là bắt buộc!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="addresses"
          label="Địa chỉ"
          rules={[{ required: true, message: 'Địa chỉ là bắt buộc!' }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          name="role"
          label="Vai trò"
          rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
        >
          <Select placeholder="Chọn vai trò">
            {userRoles.map(role => <Option key={role} value={role} style={{textTransform: 'capitalize'}}>{role}</Option>)}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Tạo tài khoản
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UserForm;