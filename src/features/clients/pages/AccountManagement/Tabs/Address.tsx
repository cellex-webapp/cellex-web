import React, { useState, useEffect } from 'react';
import { Typography, Form, Button, Space, message, Descriptions, Card, Tag } from 'antd';
import { EnvironmentOutlined, SwapOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/redux';
import { updateUserProfile } from '@/stores/slices/user.slice';
import { AddressSelector, DualAddressDisplay } from '@/components/address';
import type { AddressSelectorValue } from '@/components/address';

const { Title } = Typography;

const Address: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Address state using new dual system
  const [addressValue, setAddressValue] = useState<AddressSelectorValue>({
    newWardCode: '',
    detailAddress: '',
  });

  // Check if user has address
  const hasAddress = () => {
    if (!currentUser) return false;
    const anyUser: any = currentUser as any;
    const wardCode = anyUser.communeCode ?? anyUser.commune_code ?? anyUser.address?.communeCode;
    const detailAddress = anyUser.detailAddress ?? anyUser.detail_address ?? anyUser.address?.detailAddress ?? anyUser.address?.street;
    return Boolean(wardCode || detailAddress);
  };

  useEffect(() => {
    if (currentUser) {
      const anyUser: any = currentUser as any;
      const wardCode = anyUser.communeCode ?? anyUser.commune_code ?? anyUser.address?.communeCode ?? '';
      const provinceCode = anyUser.provinceCode ?? anyUser.province_code ?? anyUser.address?.provinceCode ?? '';
      const detailAddress = anyUser.detailAddress ?? anyUser.detail_address ?? anyUser.address?.detailAddress ?? anyUser.address?.street ?? '';
      
      setAddressValue({
        newWardCode: wardCode,
        detailAddress: detailAddress,
        newProvinceCode: provinceCode,
      });
      
      setIsEditing(!hasAddress());
    }
  }, [currentUser]);

  const onFinish = async () => {
    if (!addressValue.newWardCode) {
      message.warning('Vui lòng chọn địa chỉ phường/xã');
      return;
    }
    if (!addressValue.detailAddress?.trim()) {
      message.warning('Vui lòng nhập địa chỉ chi tiết');
      return;
    }

    setLoading(true);
    try {
      const payload: IUpdateProfilePayload = {
        fullName: (currentUser as any)?.fullName ?? undefined,
        phoneNumber: (currentUser as any)?.phoneNumber ?? undefined,
        provinceCode: addressValue.newProvinceCode || undefined,
        communeCode: addressValue.newWardCode || undefined,
        detailAddress: addressValue.detailAddress || undefined,
      };

      const res: any = await dispatch(updateUserProfile(payload));
      if (res?.error) {
        throw new Error(res.error?.message ?? 'Cập nhật thất bại');
      }

      message.success('Cập nhật địa chỉ nhận hàng thành công');
      setIsEditing(false);

      // Refresh user data
      await refreshUser();
    } catch (err: any) {
      message.error(err?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const renderDisplayView = () => {
    const fromStorage = (() => {
      try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();
    
    const user = currentUser ?? fromStorage;
    const anyUser: any = user as any;
    
    const wardCode = anyUser?.communeCode ?? anyUser?.commune_code ?? anyUser?.address?.communeCode;
    const detailAddress = anyUser?.detailAddress ?? anyUser?.detail_address ?? anyUser?.address?.detailAddress ?? anyUser?.address?.street;

    if (!wardCode && !detailAddress) {
      return (
        <div className="text-center py-8">
          <EnvironmentOutlined className="text-4xl text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Chưa có địa chỉ nhận hàng.</p>
          <Button type="primary" className="!bg-indigo-600" onClick={() => setIsEditing(true)}>
            Thêm địa chỉ
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Basic Info */}
        <Card size="small" title="Thông tin cơ bản">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Họ và tên">{anyUser?.fullName ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{anyUser?.phoneNumber ?? anyUser?.phone_number ?? '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Dual Address Display */}
        <Card 
          size="small" 
          title={
            <Space>
              <EnvironmentOutlined />
              <span>Địa chỉ nhận hàng</span>
            </Space>
          }
        >
          <DualAddressDisplay
            newWardCode={wardCode}
            detailAddress={detailAddress}
          />
        </Card>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={4} style={{ margin: 0 }}>Địa chỉ nhận hàng</Title>
        {!isEditing && hasAddress() && (
          <Button className='!bg-indigo-600' type="primary" onClick={() => setIsEditing(true)}>
            Cập nhật địa chỉ
          </Button>
        )}
      </div>

      {!isEditing ? (
        renderDisplayView()
      ) : (
        <div style={{ maxWidth: 800 }}>
          <Card 
            title={
              <Space>
                <EnvironmentOutlined className="text-blue-500" />
                <span>Nhập địa chỉ mới</span>
                <Tag color="green">Hỗ trợ cả 2 hệ thống địa chỉ</Tag>
              </Space>
            }
          >
            <AddressSelector
              value={addressValue}
              onChange={setAddressValue}
              required={true}
              showModeSelector={true}
              defaultMode="new"
              layout="horizontal"
            />
            
            <div className="mt-6 flex gap-2">
              <Button 
                className="!bg-indigo-600" 
                type="primary" 
                loading={loading}
                onClick={onFinish}
              >
                Lưu địa chỉ
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  // Reset to original values
                  const anyUser: any = currentUser as any;
                  setAddressValue({
                    newWardCode: anyUser?.communeCode ?? anyUser?.commune_code ?? anyUser?.address?.communeCode ?? '',
                    detailAddress: anyUser?.detailAddress ?? anyUser?.detail_address ?? anyUser?.address?.detailAddress ?? '',
                    newProvinceCode: anyUser?.provinceCode ?? anyUser?.province_code ?? anyUser?.address?.provinceCode ?? '',
                  });
                }}
              >
                Hủy
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Address;