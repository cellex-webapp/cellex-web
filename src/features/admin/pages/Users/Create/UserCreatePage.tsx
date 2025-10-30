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
      // If an image file is included, send as FormData
      if (payload && (payload as any).image && typeof File !== 'undefined' && (payload as any).image instanceof File) {
        const fd = new FormData();
        fd.append('fullName', String(payload.fullName));
        fd.append('email', String(payload.email));
        fd.append('password', String(payload.password));
        fd.append('phoneNumber', String(payload.phoneNumber));
        if (payload.provinceCode !== undefined && payload.provinceCode !== null) fd.append('provinceCode', String(payload.provinceCode));
        if (payload.communeCode !== undefined && payload.communeCode !== null) fd.append('communeCode', String(payload.communeCode));
        if (payload.detailAddress) fd.append('detailAddress', String(payload.detailAddress));
        fd.append('role', String(payload.role ?? 'USER'));
        try {
          fd.append('image', (payload as any).image as File, ((payload as any).image as File).name || 'avatar');
        } catch (e) {
          fd.append('image', (payload as any).image as any);
        }

        await addUserAccount(fd as any).unwrap();
      } else {
        await addUserAccount(payload).unwrap();
      }

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