import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Checkbox, Form, Input, Modal, Space, Table, Tag, message } from 'antd';
import { staffService } from '@/services/staff.service';

const StaffRolesPage: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissionKeys, setPermissionKeys] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [form] = Form.useForm();

  const permissionLabels: Record<string, string> = {
    'PRODUCT:VIEW': 'Xem sản phẩm',
    'PRODUCT:CREATE': 'Tạo sản phẩm',
    'PRODUCT:UPDATE': 'Cập nhật sản phẩm',
    'PRODUCT:DELETE': 'Xóa sản phẩm',
    'ORDER:VIEW': 'Xem đơn hàng',
    'ORDER:CONFIRM': 'Xác nhận đơn hàng',
    'ORDER:SHIP': 'Giao hàng',
    'INVENTORY:VIEW': 'Xem kho',
    'INVENTORY:IMPORT': 'Nhập kho',
    'INVENTORY:CHECK': 'Kiểm kho',
    'SUPPLIER:VIEW': 'Xem nhà cung cấp',
    'SUPPLIER:CREATE': 'Tạo nhà cung cấp',
    'SUPPLIER:UPDATE': 'Cập nhật nhà cung cấp',
    'REVIEW:VIEW': 'Xem đánh giá',
    'REVIEW:RESPOND': 'Phản hồi đánh giá',
    'CHAT:VIEW': 'Xem chat',
    'ANALYTICS:VIEW': 'Xem phân tích',
    'SHOP:UPDATE': 'Cập nhật cửa hàng',
    'SHOP_THEME:MANAGE': 'Quản lý giao diện',
    'LIVESTREAM:CREATE': 'Tạo livestream',
    'LIVESTREAM:MANAGE': 'Quản lý livestream',
  };

  const permissionRows = useMemo(() => (
    permissionKeys.map((key) => ({
      key,
      name: permissionLabels[key] || key,
      raw: key,
      group: key.split(':')[0],
      action: key.split(':')[1],
    }))
  ), [permissionKeys]);

  const load = async () => {
    const [r, p] = await Promise.all([staffService.getRoles(), staffService.getPermissionKeys()]);
    setRoles(r.result || []);
    setPermissionKeys(p.result || []);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreateModal = () => {
    setEditing(null);
    setSelectedPermissions([]);
    form.resetFields();
    form.setFieldsValue({ permissions: [] });
    setOpen(true);
  };

  const openEditModal = (role: any) => {
    const permissions = role?.permissions || [];
    setEditing(role);
    setSelectedPermissions(permissions);
    form.setFieldsValue({ ...role, permissions });
    setOpen(true);
  };

  const handlePermissionChange = (keys: React.Key[]) => {
    const values = keys.map(String);
    setSelectedPermissions(values);
    form.setFieldsValue({ permissions: values });
  };

  return (
    <Card title="Quản lý vai trò nhân viên" extra={<Button onClick={openCreateModal} type="primary">Tạo vai trò mới</Button>}>
      <Table
        rowKey="id"
        dataSource={roles}
        columns={[
          { title: 'Tên vai trò', dataIndex: 'name' },
          { title: 'Mô tả', dataIndex: 'description' },
          { title: 'Số quyền', render: (_, r: any) => (r.permissions || []).length },
          {
            title: 'Chức năng',
            render: (_, r: any) => (
              <Space wrap>
                {(r.permissions || []).slice(0, 5).map((x: string) => (
                  <Tag key={x}>{permissionLabels[x] || x}</Tag>
                ))}
              </Space>
            )
          },
          {
            title: 'Hành động',
            render: (_, r: any) => (
              <Space>
                <Button onClick={() => openEditModal(r)}>Sửa</Button>
                <Button danger onClick={async () => {
                  try {
                    await staffService.deleteRole(r.id);
                    message.success('Xóa vai trò thành công');
                    load();
                  } catch (e: any) {
                    message.error(e?.response?.data?.message || 'Không thể xóa vai trò');
                  }
                }}>Xóa</Button>
              </Space>
            )
          }
        ]}
      />
      <Modal open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} title={editing ? 'Cập nhật vai trò' : 'Tạo vai trò'}>
        <Form form={form} layout="vertical" onFinish={async (values) => {
          const payload = { ...values, permissions: selectedPermissions };
          if (editing) await staffService.updateRole(editing.id, payload);
          else await staffService.createRole(payload);
          setOpen(false);
          load();
        }}>
          <Form.Item name="name" label="Tên vai trò" rules={[{ required: true, message: 'Vui lòng nhập tên vai trò' }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="Chức năng" required>
            <Form.Item name="permissions" rules={[{ required: true, message: 'Vui lòng chọn ít nhất một chức năng' }]} noStyle>
              <Input type="hidden" />
            </Form.Item>
            <Table
              rowKey="key"
              dataSource={permissionRows}
              pagination={false}
              size="small"
              rowSelection={{
                selectedRowKeys: selectedPermissions,
                onChange: handlePermissionChange,
              }}
              columns={[
                { title: 'Chức năng', dataIndex: 'name' },
                { title: 'Nhóm', dataIndex: 'group', width: 140 },
                { title: 'Hành động', dataIndex: 'action', width: 140 },
              ]}
            />
            <div className="mt-2">
              <Checkbox
                checked={selectedPermissions.length === permissionKeys.length && permissionKeys.length > 0}
                indeterminate={selectedPermissions.length > 0 && selectedPermissions.length < permissionKeys.length}
                onChange={(e) => handlePermissionChange(e.target.checked ? permissionKeys : [])}
              >
                Chọn tất cả
              </Checkbox>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default StaffRolesPage;

