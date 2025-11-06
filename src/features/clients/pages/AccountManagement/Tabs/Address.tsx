import React, { useState, useEffect } from 'react';
import { Typography, Form, Input, Button, Space, message, Select, Descriptions } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/redux';
import { updateUserProfile } from '@/stores/slices/user.slice';
import { addressService } from '@/services/address.service';

const { Title } = Typography;

interface IAddress {
  provinceCode?: string;
  communeCode?: string;
  detailAddress?: string;
  street?: string;
  province?: string;
  commune?: string;
  fullAddress?: string;
}

const Address: React.FC = () => {
  const { currentUser } = useAuth();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [provinces, setProvinces] = useState<IAddressDataUnit[]>([]);
  const [communes, setCommunes] = useState<IAddressDataUnit[]>([]);
  
  const [provinceSelected, setProvinceSelected] = useState<string | undefined>(undefined);
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [communesLoading, setCommunesLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const anyUser: any = currentUser as any;
    
    const provinceCode = anyUser.provinceCode ?? anyUser.province_code ?? undefined;
    const communeCode = anyUser.communeCode ?? anyUser.commune_code ?? undefined;
    const detailAddress = anyUser.detailAddress ?? anyUser.detail_address ?? '';

    form.setFieldsValue({ provinceCode, communeCode, detailAddress });
    
    if (provinceCode) {
      setProvinceSelected(String(provinceCode)); 
    }

    const hasAddress = Boolean(detailAddress || provinceCode || communeCode);
    setIsEditing(!hasAddress);
  }, [currentUser, form]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setProvincesLoading(true);
      try {
        const resp = await addressService.getProvinces();
        if (mounted) setProvinces(resp.result || []);
      } catch (err) {
        console.error('Failed to load provinces', err);
      } finally {
        if (mounted) setProvincesLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!provinceSelected) {
      setCommunes([]);
      return;
    }

    let mounted = true;
    const load = async () => {
      setCommunesLoading(true);
      try {
        const resp = await addressService.getCommunesByProvinceCode(provinceSelected);
        if (mounted) setCommunes(resp.result || []);
      } catch (err) {
        console.error('Failed to load communes', err);
        if (mounted) setCommunes([]);
      } finally {
        if (mounted) setCommunesLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [provinceSelected]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload: IUpdateProfilePayload = {
        fullName: (currentUser as any)?.fullName ?? undefined,
        phoneNumber: (currentUser as any)?.phoneNumber ?? undefined,
        provinceCode: values.provinceCode || undefined,
        communeCode: values.communeCode || undefined,
        detailAddress: values.detailAddress || undefined,
      };

      const res: any = await dispatch(updateUserProfile(payload));
      if (res?.error) {
        throw new Error(res.error?.message ?? 'Cập nhật thất bại');
      }

      message.success('Cập nhật địa chỉ nhận hàng thành công');
      setIsEditing(false);

      try {
        const provinceName = provinces.find(p => p.code === payload.provinceCode)?.name;
        const communeName = communes.find(c => c.code === payload.communeCode)?.name;

        const address: IAddress = {
          provinceCode: payload.provinceCode,
          communeCode: payload.communeCode,
          detailAddress: payload.detailAddress,
          street: payload.detailAddress,
          province: provinceName,
          commune: communeName,
          fullAddress: [payload.detailAddress, communeName, provinceName].filter(Boolean).join(', '),
        };

        const raw = localStorage.getItem('user');
        if (raw) {
          try {
            const u = JSON.parse(raw);
            u.address = address; 
            u.provinceCode = payload.provinceCode;
            u.communeCode = payload.communeCode;
            u.detailAddress = payload.detailAddress;
            localStorage.setItem('user', JSON.stringify(u));
          } catch { /* ignore */ }
        } else {
          localStorage.setItem('address', JSON.stringify(address)); 
        }
      } catch (e) { /* ignore storage errors */ }
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
    
    const detailAddress = anyUser?.detailAddress ?? anyUser?.address?.detailAddress ?? anyUser?.address?.street;
    const provinceCode = anyUser?.provinceCode ?? anyUser?.address?.provinceCode;
    const communeCode = anyUser?.communeCode ?? anyUser?.address?.communeCode;

    const hasAddress = Boolean(detailAddress || provinceCode || communeCode);

    if (!hasAddress) {
      return (
        <div>
          <p>Chưa có địa chỉ nhận hàng.</p>
          <Button type="primary" onClick={() => setIsEditing(true)}>
            Thêm địa chỉ
          </Button>
        </div>
      );
    }

    const provinceName = anyUser?.address?.province ?? provinces.find(p => p.code === provinceCode)?.name;
    const communeName = anyUser?.address?.commune ?? communes.find(c => c.code === communeCode)?.name;
    const fullAddress = anyUser?.address?.fullAddress ?? [detailAddress, communeName, provinceName].filter(Boolean).join(', ');

    return (
      <div style={{ width: '100%' }}>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Họ và tên">{anyUser?.fullName ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{anyUser?.phoneNumber ?? anyUser?.phone_number ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Tỉnh/Thành">{provinceName ?? provinceCode ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Phường/Xã">{communeName ?? communeCode ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ chi tiết">{detailAddress ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ đầy đủ">{fullAddress}</Descriptions.Item>
        </Descriptions>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Địa chỉ nhận hàng</Title>
        {!isEditing && (
          <Button className='!bg-indigo-600' type="primary" onClick={() => setIsEditing(true)}>
            Cập nhật địa chỉ
          </Button>
        )}
      </div>

      {!isEditing ? (
        renderDisplayView()
      ) : (
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 640 }}>
          <Form.Item label="Tỉnh/Thành" name="provinceCode">
            <Select
              showSearch
              placeholder="Chọn tỉnh/thành"
              loading={provincesLoading}
              optionFilterProp="label" 
              onChange={(value) => {
                setProvinceSelected(String(value));
                form.setFieldsValue({ communeCode: undefined });
              }}
              options={provinces.map((p) => ({
                value: p.code,
                label: p.name,
              }))}
            />
          </Form.Item>

          <Form.Item label="Phường/Xã" name="communeCode">
            <Select
              showSearch
              placeholder="Chọn phường/xã"
              loading={communesLoading}
              disabled={!provinceSelected || communesLoading}
              optionFilterProp="label"
              options={communes.map((c) => ({
                value: c.code,
                label: c.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Địa chỉ chi tiết"
            name="detailAddress"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
          >
            <Input.TextArea rows={3} placeholder="Số nhà, tên đường..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Lưu địa chỉ
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  form.resetFields();
                  const anyUser: any = currentUser as any;
                  const provinceCode = anyUser.provinceCode ?? anyUser.province_code ?? undefined;
                  form.setFieldsValue({
                    provinceCode: provinceCode,
                    communeCode: anyUser?.communeCode ?? anyUser?.commune_code ?? undefined,
                    detailAddress: anyUser?.detailAddress ?? anyUser?.detail_address ?? '',
                  });
                  setProvinceSelected(provinceCode ? String(provinceCode) : undefined);
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default Address;