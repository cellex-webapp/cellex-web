import React, { useState, useEffect } from 'react';
import { Typography, Form, Input, Button, Space, message, Select } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/redux';
import { updateUserProfile } from '@/stores/slices/user.slice';
import { addressService } from '@/services/address.service';

const { Title } = Typography;

const Address: React.FC = () => {
  const { currentUser } = useAuth();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [communes, setCommunes] = useState<string[]>([]);
  const [provinceSelected, setProvinceSelected] = useState<string | undefined>(undefined);
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [communesLoading, setCommunesLoading] = useState(false);

  // Prefill form if currentUser has address fields
  useEffect(() => {
    if (!currentUser) return;
    const anyUser: any = currentUser as any;
    form.setFieldsValue({
      provinceCode: anyUser.provinceCode ?? anyUser.province_code ?? '',
      communeCode: anyUser.communeCode ?? anyUser.commune_code ?? '',
      detailAddress: anyUser.detailAddress ?? anyUser.detail_address ?? '',
    });
    // set provinceSelected so we can load communes for prefilled value
    const preProvince = anyUser.provinceCode ?? anyUser.province_code ?? '';
    if (preProvince) setProvinceSelected(String(preProvince));
    // if user has no address fields, default to not showing address and let user add
    const hasAddress = Boolean(
      anyUser.detailAddress ?? anyUser.detail_address ?? anyUser.provinceCode ?? anyUser.province_code ?? anyUser.communeCode ?? anyUser.commune_code
    );
    setIsEditing(!hasAddress);
  }, [currentUser, form]);

  // fetch provinces on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setProvincesLoading(true);
      try {
        const resp: any = await addressService.getProvinces();
        // resp.result expected to be string[]
        if (mounted) setProvinces(resp.result || []);
      } catch (err) {
        // ignore silently or show message
        console.error('Failed to load provinces', err);
      } finally {
        if (mounted) setProvincesLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // fetch communes when provinceSelected changes
  useEffect(() => {
    if (!provinceSelected) {
      setCommunes([]);
      return;
    }

    let mounted = true;
    const load = async () => {
      setCommunesLoading(true);
      try {
        const codeNum = Number(provinceSelected);
        const resp: any = await addressService.getCommunesByProvinceCode(codeNum);
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

      // dispatch the thunk and wait for result
      // unwrap is not used here to avoid importing additional helpers; handle result via promise
      const res: any = await dispatch(updateUserProfile(payload));
      if (res?.error) {
        throw new Error(res.error?.message ?? 'Cập nhật thất bại');
      }

      message.success('Cập nhật địa chỉ nhận hàng thành công');
      // close edit form after successful update
      setIsEditing(false);

      // persist address locally for quick reads (structure: IAddress)
      try {
        const address: IAddress = {
          provinceCode: payload.provinceCode,
          communeCode: payload.communeCode,
          detailAddress: payload.detailAddress,
          // derive fullAddress from pieces where possible
          fullAddress: [payload.detailAddress, payload.communeCode, payload.provinceCode].filter(Boolean).join(', '),
        };

        // write separate address key
        localStorage.setItem('address', JSON.stringify(address));

        // also update user entry in localStorage if present
        const raw = localStorage.getItem('user');
        if (raw) {
          try {
            const u = JSON.parse(raw);
            u.address = address;
            localStorage.setItem('user', JSON.stringify(u));
          } catch {
            // ignore
          }
        }
      } catch (e) {
        // ignore storage errors
      }
    } catch (err: any) {
      message.error(err?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={4}>Địa chỉ nhận hàng</Title>

      {!isEditing ? (
        // display user's address summary
        (() => {
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
          const hasAddress = Boolean(
            anyUser?.detailAddress ?? anyUser?.detail_address ?? anyUser?.provinceCode ?? anyUser?.province_code ?? anyUser?.communeCode ?? anyUser?.commune_code
          );

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

          return (
            <div style={{ maxWidth: 640 }}>
              <div style={{ marginBottom: 12 }}>
                <div><strong>Họ và tên:</strong> {anyUser?.fullName ?? '-'}</div>
                <div><strong>Số điện thoại:</strong> {anyUser?.phoneNumber ?? anyUser?.phone_number ?? '-'}</div>
                <div><strong>Tỉnh/Thành (mã):</strong> {anyUser?.provinceCode ?? anyUser?.province_code ?? '-'}</div>
                <div><strong>Phường/Xã (mã):</strong> {anyUser?.communeCode ?? anyUser?.commune_code ?? '-'}</div>
                <div><strong>Địa chỉ chi tiết:</strong> {anyUser?.detailAddress ?? anyUser?.detail_address ?? '-'}</div>
              </div>
              <Space>
                <Button type="primary" onClick={() => setIsEditing(true)}>
                  Cập nhật địa chỉ
                </Button>
              </Space>
            </div>
          );
        })()
      ) : (
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 640 }}>
        <Form.Item label="Tỉnh/Thành (mã)" name="provinceCode">
          <Select
            showSearch
            placeholder="Chọn tỉnh/thành"
            loading={provincesLoading}
            optionFilterProp="label"
            onChange={(value) => {
              setProvinceSelected(String(value));
              // when province changes, clear commune field
              form.setFieldsValue({ communeCode: '' });
            }}
            options={provinces.map((p) => {
              if (typeof p === 'string') return { value: p, label: p };
              // in case the API returns objects
              return { value: (p as any).code ?? (p as any).id ?? JSON.stringify(p), label: (p as any).name ?? String(p) };
            })}
          />
        </Form.Item>

        <Form.Item label="Phường/Xã (mã)" name="communeCode">
          <Select
            showSearch
            placeholder="Chọn phường/xã"
            loading={communesLoading}
            disabled={!provinceSelected}
            optionFilterProp="label"
            options={communes.map((c) => {
              if (typeof c === 'string') return { value: c, label: c };
              return { value: (c as any).code ?? (c as any).id ?? JSON.stringify(c), label: (c as any).name ?? String(c) };
            })}
          />
        </Form.Item>

        <Form.Item
          label="Địa chỉ chi tiết"
          name="detailAddress"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
        >
          <Input.TextArea rows={4} placeholder="Số nhà, đường, phường/xã, quận/huyện..." />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu địa chỉ
            </Button>
            <Button
              onClick={() => {
                // cancel editing
                setIsEditing(false);
                form.resetFields();
                // Refill from currentUser after reset
                const anyUser: any = currentUser as any;
                form.setFieldsValue({
                  provinceCode: anyUser?.provinceCode ?? anyUser?.province_code ?? '',
                  communeCode: anyUser?.communeCode ?? anyUser?.commune_code ?? '',
                  detailAddress: anyUser?.detailAddress ?? anyUser?.detail_address ?? '',
                });
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
