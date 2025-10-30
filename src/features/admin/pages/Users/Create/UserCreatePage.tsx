import React from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import UserForm from './UserForm';
import { useUser } from '@/hooks/useUser'; 

const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addUserAccount, isLoading } = useUser();

  const handleSubmit = async (payload: IAddAccountPayload) => {
    try {
      await addUserAccount(payload).unwrap();

      message.success('Tạo tài khoản thành công');
      navigate('/admin/users');
    } catch (rejectedValue: any) {
      message.error(String(rejectedValue) || 'Không thể tạo tài khoản');
    }
  };

  return (
    <div className="p-4 flex justify-center">
      <div style={{ width: '100%', maxWidth: 900 }}>
        <h1 className="mb-4 text-xl font-semibold">Tạo người dùng</h1>
        <UserForm loading={isLoading} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default UserCreatePage;