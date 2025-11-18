import React from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import UserForm from './UserForm';
import { useUser } from '@/hooks/useUser';

const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addUserAccount, isLoading } = useUser();

  const handleSubmit = async (payload: IAddAccountPayload & { image?: File }) => {
    try {
      await addUserAccount(payload).unwrap(); 
      
      message.success('Tạo tài khoản thành công');
      navigate('/admin/users');
    } catch (rejectedValue: any) {
      const errMsg = typeof rejectedValue === 'string' ? rejectedValue : 'Không thể tạo tài khoản';
      message.error(errMsg);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Tạo người dùng mới</h1>
          <p className="text-gray-500 mt-1">Điền thông tin để tạo tài khoản người dùng</p>
        </div>
        <UserForm loading={isLoading} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default UserCreatePage;