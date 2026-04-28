import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, App, Button, Card, Form, Input, Modal, Space, Table, Typography } from 'antd';
import { EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import useSupplier from '@/hooks/useSupplier';
import { useAuth } from '@/hooks/useAuth';

const { Text } = Typography;

const SuppliersPageContent: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<ICreateSupplierPayload>();
  const { userRole, currentShop } = useAuth();

  const { suppliers, pagination, isLoading, fetchSuppliers, createSupplier, updateSupplier } = useSupplier();
  const canManage = userRole === 'VENDOR';

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<ISupplier | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadSuppliers = useCallback(async () => {
    await fetchSuppliers({
      page,
      limit,
      sortBy: 'createdAt',
      sortType: 'desc',
      search: search.trim() || undefined,
        shopId: canManage ? currentShop?.id : undefined,
    });
  }, [fetchSuppliers, page, limit, search, canManage, currentShop?.id]);

  useEffect(() => {
    loadSuppliers().catch(() => undefined);
  }, [loadSuppliers]);

  const openCreateModal = () => {
    setEditingSupplier(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (supplier: ISupplier) => {
    if (!canManage) return;
    setEditingSupplier(supplier);
    form.setFieldsValue({
      supplierName: supplier.supplierName,
      phoneNumber: supplier.phoneNumber,
      email: supplier.email,
      address: supplier.address,
      taxCode: supplier.taxCode,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!canManage) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, values);
        message.success('Cập nhật nhà cung cấp thành công');
      } else {
        await createSupplier({
          ...values,
          shopId: currentShop?.id,
        });
        message.success('Tạo nhà cung cấp thành công');
      }

      setIsModalOpen(false);
      form.resetFields();
      await loadSuppliers();
    } catch (err: any) {
      if (!err?.errorFields) {
        message.error(err?.message || 'Không thể lưu nhà cung cấp');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<ISupplier> = useMemo(() => [
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 150,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      render: (value?: string) => value || <Text type="secondary">—</Text>,
    },
    {
      title: 'Mã số thuế',
      dataIndex: 'taxCode',
      key: 'taxCode',
      width: 160,
    },
    {
      title: 'Tạo lúc',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (value?: string) => value ? new Date(value).toLocaleString('vi-VN') : <Text type="secondary">—</Text>,
    },
    ...(canManage ? [{
      title: 'Hành động',
      key: 'action',
      width: 110,
      align: 'center' as const,
      render: (_: unknown, supplier: ISupplier) => (
        <Button icon={<EditOutlined />} onClick={() => openEditModal(supplier)}>
          Sửa
        </Button>
      ),
    }] : []),
  ], [canManage]);

  return (
    <div className="p-4">
      <Card
        title={canManage ? 'Quản lý nhà cung cấp' : 'Theo dõi nhà cung cấp'}
        className="shadow-sm"
        extra={
          <Space>
            <Input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              prefix={<SearchOutlined />}
              placeholder="Tìm theo tên nhà cung cấp"
              allowClear
              style={{ width: 260 }}
            />
            {canManage && (
              <Button type="primary" className="!bg-indigo-600" icon={<PlusOutlined />} onClick={openCreateModal}>
                Thêm nhà cung cấp
              </Button>
            )}
          </Space>
        }
      >
        {!canManage && (
          <Alert
            className="mb-4"
            type="info"
            showIcon
            message="Chế độ theo dõi"
            description="Tài khoản admin chỉ có quyền xem dữ liệu. Mọi thao tác thay đổi nhà cung cấp chỉ áp dụng cho vendor."
          />
        )}
        <Table<ISupplier>
          rowKey="id"
          columns={columns}
          dataSource={suppliers}
          loading={isLoading}
          pagination={{
            current: pagination?.currentPage ?? page,
            pageSize: pagination?.pageSize ?? limit,
            total: pagination?.totalElements ?? 0,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhà cung cấp`,
            onChange: (nextPage, nextSize) => {
              setPage(nextPage);
              setLimit(nextSize);
            },
          }}
        />
      </Card>

      {canManage && (
        <Modal
          title={editingSupplier ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp'}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleSubmit}
          confirmLoading={submitting}
          okText={editingSupplier ? 'Cập nhật' : 'Tạo mới'}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="supplierName" label="Tên nhà cung cấp" rules={[{ required: true, message: 'Nhập tên nhà cung cấp' }]}>
              <Input placeholder="VD: Công ty TNHH ABC" />
            </Form.Item>
            <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true, message: 'Nhập số điện thoại' }]}>
              <Input placeholder="VD: 0901234567" />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
              <Input placeholder="VD: supplier@example.com" />
            </Form.Item>
            <Form.Item name="taxCode" label="Mã số thuế" rules={[{ required: true, message: 'Nhập mã số thuế' }]}>
              <Input placeholder="VD: 0312345678" />
            </Form.Item>
            <Form.Item name="address" label="Địa chỉ">
              <Input.TextArea rows={3} placeholder="Địa chỉ nhà cung cấp" />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

const SuppliersPage: React.FC = () => (
  <App>
    <SuppliersPageContent />
  </App>
);

export default SuppliersPage;
