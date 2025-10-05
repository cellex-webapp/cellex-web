import React, { useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import UserForm from '../components/UserForm';
import type { CreateUserRequest } from '@/types/user.type';
import { addAccount } from '@/services/userApi';

const UserCreatePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (payload: CreateUserRequest) => {
    try {
      setLoading(true);
      await addAccount(payload);
      message.success('Tạo tài khoản thành công');
      navigate('/admin/users');
    } catch (e: any) {
      message.error(e?.message || 'Không thể tạo tài khoản');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-semibold">Tạo người dùng</h1>
      <UserForm loading={loading} onSubmit={handleSubmit} />
    </div>
  );
};

export default UserCreatePage;
