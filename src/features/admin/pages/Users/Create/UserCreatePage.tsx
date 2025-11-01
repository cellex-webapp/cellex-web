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
      // Always send as FormData to match API spec (avatar field)
      const fd = new FormData();
      fd.append('fullName', String(payload.fullName));
      fd.append('email', String(payload.email));
      fd.append('password', String(payload.password));
      fd.append('phoneNumber', String(payload.phoneNumber));
      fd.append('role', String(payload.role));
      
      // Optional fields
      if (payload.provinceCode) fd.append('provinceCode', String(payload.provinceCode));
      if (payload.communeCode) fd.append('communeCode', String(payload.communeCode));
      if (payload.detailAddress) fd.append('detailAddress', String(payload.detailAddress));
      
      // Avatar field (matches API spec)
      if (payload.image && payload.image instanceof File) {
        fd.append('avatar', payload.image, payload.image.name || 'avatar');
      }

      await addUserAccount(fd as any).unwrap();
      message.success('Tạo tài khoản thành công');
      navigate('/admin/users');
    } catch (rejectedValue: any) {
      const errMsg = rejectedValue?.message || String(rejectedValue) || 'Không thể tạo tài khoản';
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