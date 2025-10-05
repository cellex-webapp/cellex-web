import React, { useEffect, useState } from 'react';
import { Modal, Descriptions, Form, Input, message, Button, Skeleton, Select } from 'antd';
import { getUserById, updateUserByAdmin, updateProfile } from '@/services/userApi';
import type { AppUser, UpdateProfileRequest } from '@/types/user.type';
import { getProvinces, getCommunesByProvince } from '@/services/addressApi';
import type { Province, Commune } from '@/types/address.type';

type Props = {
  userId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
};

const UserDetailModal: React.FC<Props> = ({ userId, open, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [form] = Form.useForm<UpdateProfileRequest>();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    const loadProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const list = await getProvinces();
        if (isMounted) setProvinces(list);
      } catch (e: any) {
        message.error(e?.message || 'Không thể tải danh sách tỉnh/thành');
      } finally {
        if (isMounted) setLoadingProvinces(false);
      }
    };
    loadProvinces();
    return () => { isMounted = false; };
  }, [open]);

  useEffect(() => {
    if (!open || !userId) return;
    let isMounted = true;
    const run = async () => {
      setLoading(true);
      try {
        const data = await getUserById(userId);
        if (!isMounted) return;
        setUser(data);
        form.setFieldsValue({
          fullName: data.fullName || '',
          avatar: data.avatarUrl || undefined,
          detailAddress: data.detailAddress || undefined,
          provinceCode: data.provinceCode || undefined,
          communeCode: data.communeCode || undefined,
        });
        if (data.provinceCode) {
          setLoadingCommunes(true);
          try {
            const c = await getCommunesByProvince(data.provinceCode);
            if (isMounted) setCommunes(c);
          } finally {
            if (isMounted) setLoadingCommunes(false);
          }
        } else {
          setCommunes([]);
        }
      } catch (e: any) {
        message.error(e?.message || 'Không thể tải thông tin người dùng');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    run();
    return () => { isMounted = false; };
  }, [open, userId, form]);

  const handleProvinceChange = async (code?: string) => {
    form.setFieldsValue({ provinceCode: code, communeCode: undefined });
    if (!code) {
      setCommunes([]);
      return;
    }
    setLoadingCommunes(true);
    try {
      const c = await getCommunesByProvince(code);
      setCommunes(c);
    } catch (e: any) {
      message.error(e?.message || 'Không thể tải danh sách phường/xã');
    } finally {
      setLoadingCommunes(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      // If admin is editing a specific user, use admin endpoint; fallback to self profile when userId is current.
      if (user?.id) {
        await updateUserByAdmin(user.id, values);
      } else {
        await updateProfile(values);
      }
      message.success('Cập nhật thành công');
      onUpdated?.();
      onClose();
    } catch (e: any) {
      if (e?.errorFields) return; // form validation error
      const msg = e?.message || 'Cập nhật không thành công';
      // Surface friendlier 401/403
      if ((e?.code === 401 || e?.code === 403)) {
        message.error('Bạn không có quyền cập nhật thông tin người dùng này (401/403).');
      } else {
        message.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onCancel={onClose} title="Thông tin người dùng" width={720} footer={null}>
      <div className="space-y-4">
        {loading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : (
          <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="ID">{user?.id}</Descriptions.Item>
          <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
          <Descriptions.Item label="Vai trò">{user?.role}</Descriptions.Item>
          </Descriptions>
        )}

  <Form form={form} layout="vertical" disabled={loading}>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="avatar" label="Ảnh đại diện (URL)">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="detailAddress" label="Địa chỉ chi tiết">
            <Input placeholder="Số nhà, đường" />
          </Form.Item>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item name="provinceCode" label="Tỉnh/Thành phố">
              <Select
                allowClear
                placeholder="Chọn tỉnh/thành"
                loading={loadingProvinces}
                showSearch
                optionFilterProp="children"
                onChange={(val) => handleProvinceChange(val)}
              >
                {provinces.map((p) => (
                  <Select.Option key={p.code} value={p.code}>
                    {p.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="communeCode" label="Xã/Phường">
              <Select
                allowClear
                placeholder="Chọn xã/phường"
                loading={loadingCommunes}
                showSearch
                optionFilterProp="children"
                disabled={!form.getFieldValue('provinceCode')}
              >
                {communes.map((c) => (
                  <Select.Option key={c.code} value={c.code}>
                    {c.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </Form>
        <div className="flex justify-end">
          <Button onClick={onClose} className="mr-2">Huỷ</Button>
          <Button type="primary" onClick={handleSave} loading={saving} className="bg-indigo-600">Lưu thay đổi</Button>
        </div>
      </div>
    </Modal>
  );
};

export default UserDetailModal;
