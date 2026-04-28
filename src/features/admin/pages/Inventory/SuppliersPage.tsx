import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, App, Button, Card, Col, Form, Input, Modal, Row, Space, Table, Typography } from 'antd';
import { EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { AddressSelector } from '@/components/address';
import type { AddressSelectorValue } from '@/components/address';
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
  const [addressValue, setAddressValue] = useState<AddressSelectorValue>({
    newWardCode: '',
    detailAddress: '',
  });

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
    setAddressValue({
      newWardCode: '',
      detailAddress: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (supplier: ISupplier) => {
    if (!canManage) return;
    setEditingSupplier(supplier);
    form.setFieldsValue({
      supplierName: supplier.supplierName,
      phoneNumber: supplier.phoneNumber,
      email: supplier.email,
      taxCode: supplier.taxCode,
    });
    setAddressValue({
      newWardCode: '',
      detailAddress: supplier.address || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!canManage) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const normalizedAddress = addressValue.fullAddressNew?.trim()
        || addressValue.detailAddress.trim()
        || editingSupplier?.address?.trim()
        || undefined;

      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, {
          ...values,
          address: normalizedAddress,
        });
        message.success('Cập nhật nhà cung cấp thành công');
      } else {
        await createSupplier({
          ...values,
          address: normalizedAddress,
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
          cancelText="Hủy"
          okText={editingSupplier ? 'Cập nhật' : 'Tạo mới'}
          width={760}
          destroyOnClose
        >
          <Form form={form} layout="vertical" className="pt-2">
            <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="mb-4">
                <Typography.Title level={5} className="!mb-1">
                  Thông tin chung
                </Typography.Title>
                <Typography.Text type="secondary">
                  Cung cấp tên, liên hệ và mã số thuế của nhà cung cấp.
                </Typography.Text>
              </div>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="supplierName" label="Tên nhà cung cấp" rules={[{ required: true, message: 'Nhập tên nhà cung cấp' }]}>
                    <Input placeholder="VD: Công ty TNHH ABC" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true, message: 'Nhập số điện thoại' }]}>
                    <Input placeholder="VD: 0901234567" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
                    <Input placeholder="VD: supplier@example.com" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="taxCode" label="Mã số thuế" rules={[{ required: true, message: 'Nhập mã số thuế' }]}>
                    <Input placeholder="VD: 0312345678" size="large" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-4">
                <Typography.Title level={5} className="!mb-1">
                  Địa chỉ
                </Typography.Title>
                <Typography.Text type="secondary">
                  Chọn địa chỉ mới hoặc địa chỉ cũ để đồng bộ sang chuỗi địa chỉ chuẩn.
                </Typography.Text>
              </div>

              <AddressSelector
                value={addressValue}
                onChange={setAddressValue}
                required
                showModeSelector={true}
                defaultMode="new"
                layout="vertical"
                size="middle"
              />
            </div>
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
