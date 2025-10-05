import React from 'react';
import { Form, Input, Button } from 'antd';
import type { CreateUserRequest } from '@/types/user.type';

type Props = {
  loading?: boolean;
  onSubmit: (payload: CreateUserRequest) => Promise<void> | void;
};

const UserForm: React.FC<Props> = ({ loading, onSubmit }) => {
  const [form] = Form.useForm<CreateUserRequest>();

  const handleFinish = async (values: CreateUserRequest) => {
    await onSubmit(values);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleFinish}
      className="bg-white/5 p-6 rounded-lg border border-white/10"
      initialValues={{ fullName: '', email: '', password: '', phoneNumber: '', addresses: '' }}
    >
      <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
        <Input placeholder="Nguyễn Văn A" />
      </Form.Item>
      <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
        <Input placeholder="example@domain.com" />
      </Form.Item>
      <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
        <Input.Password placeholder="••••••••" />
      </Form.Item>
      <Form.Item name="phoneNumber" label="Số điện thoại">
        <Input placeholder="0901234567" />
      </Form.Item>
      <Form.Item name="addresses" label="Địa chỉ">
        <Input placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" />
      </Form.Item>

      <div className="flex justify-end">
        <Button type="primary" htmlType="submit" loading={loading} className="bg-indigo-600">
          Tạo tài khoản
        </Button>
      </div>
    </Form>
  );
};

export default UserForm;
