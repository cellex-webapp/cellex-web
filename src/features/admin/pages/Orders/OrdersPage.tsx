import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Drawer, Input, Select, Space, Table, Tag, Typography, message } from 'antd';
import { useOrder } from '@/hooks/useOrder';
import { formatDateVN } from '@/utils/date';

const { Title } = Typography;

const statusColor: Record<OrderStatus, string> = {
  PENDING: 'gold',
  CONFIRMED: 'blue',
  SHIPPING: 'purple',
  DELIVERED: 'green',
  CANCELLED: 'red',
};

const currency = (n?: number) =>
  typeof n === 'number'
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
    : '';

const AdminOrdersPage: React.FC = () => {
  const { isLoading, error, adminOrders, fetchAdminOrders, fetchOrderById, selectedOrder } = useOrder();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const [userId, setUserId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'createdAt' | 'totalAmount' | 'status'>('createdAt');
  const [sortType, setSortType] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const load = useCallback(() => {
    fetchAdminOrders({
      status,
      userId: userId || undefined,
      vendorId: vendorId || undefined,
      page,
      limit: pageSize,
      sortBy,
      sortType,
    });
  }, [status, userId, vendorId, page, pageSize, sortBy, sortType, fetchAdminOrders]);

  useEffect(() => { load(); }, [load]);

  const data = useMemo(() => (Array.isArray(adminOrders?.content) ? adminOrders!.content : []), [adminOrders]);

  const columns = [
    { title: 'Mã đơn', dataIndex: 'id', key: 'id', width: 240 },
    { title: 'User', dataIndex: 'user_id', key: 'user_id', width: 160 },
    { title: 'Shop', dataIndex: 'shop_name', key: 'shop_name', width: 200 },
    { title: 'Shop ID', dataIndex: 'shop_id', key: 'shop_id', width: 160 },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (s: OrderStatus) => <Tag color={statusColor[s]}>{s}</Tag>,
      width: 120,
    },
    { title: 'Tạm tính', dataIndex: 'subtotal', key: 'subtotal', render: currency, align: 'right', width: 140 },
    { title: 'Giảm', dataIndex: 'discount_amount', key: 'discount_amount', render: currency, align: 'right', width: 120 },
    { title: 'Thành tiền', dataIndex: 'total_amount', key: 'total_amount', render: currency, align: 'right', width: 140 },
    { title: 'Tạo lúc', dataIndex: 'created_at', key: 'created_at', render: (v: string) => formatDateVN(v), width: 180 },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right' as const,
      render: (_: any, r: IOrder) => (
        <Button size="small" onClick={() => { fetchOrderById(r.id); setOpen(true); }}>Chi tiết</Button>
      ),
      width: 100,
    },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg p-4">
        <Title level={4}>Đơn hàng (Admin)</Title>

        <div className="flex flex-col gap-2 my-3">
          <Space wrap>
            <Select
              allowClear
              placeholder="Trạng thái"
              style={{ width: 180 }}
              value={status}
              onChange={(val) => { setStatus(val as OrderStatus | undefined); setPage(1); }}
              options={['PENDING','CONFIRMED','SHIPPING','DELIVERED','CANCELLED'].map((s) => ({ value: s, label: s }))}
            />
            <Input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} style={{ width: 220 }} />
            <Input placeholder="Vendor ID" value={vendorId} onChange={(e) => setVendorId(e.target.value)} style={{ width: 220 }} />
            <Select
              value={sortBy}
              style={{ width: 180 }}
              onChange={(v) => { setSortBy(v as any); setPage(1); }}
              options={[
                { value: 'createdAt', label: 'Sắp xếp: Ngày tạo' },
                { value: 'totalAmount', label: 'Sắp xếp: Tổng tiền' },
                { value: 'status', label: 'Sắp xếp: Trạng thái' },
              ]}
            />
            <Select
              value={sortType}
              style={{ width: 140 }}
              onChange={(v) => { setSortType(v as any); setPage(1); }}
              options={[{ value: 'desc', label: 'Giảm dần' }, { value: 'asc', label: 'Tăng dần' }]}
            />
            <Select
              value={pageSize}
              style={{ width: 120 }}
              onChange={(v) => { setPageSize(Number(v)); setPage(1); }}
              options={[10,20,50,100].map(n => ({ value: n, label: `${n}/trang` }))}
            />
            <Button onClick={() => { setPage(1); load(); }}>Lọc</Button>
          </Space>
        </div>

        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={data}
          columns={columns as any}
          size="middle"
          scroll={{ x: 1000 }}
          pagination={{
            current: page,
            pageSize,
            total: adminOrders?.totalElements || 0,
            showSizeChanger: true,
          }}
          onChange={(p) => {
            setPage(p.current || 1);
            setPageSize(p.pageSize || 10);
          }}
        />
      </div>

      <Drawer title={`Chi tiết đơn ${selectedOrder?.id || ''}`} placement="right" width={560} onClose={() => setOpen(false)} open={open}>
        {selectedOrder ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Trạng thái</span>
              <Tag color={statusColor[selectedOrder.status]}>{selectedOrder.status}</Tag>
            </div>
            <div className="flex justify-between"><span>Cửa hàng</span><b>{selectedOrder.shop_name} ({selectedOrder.shop_id})</b></div>
            <div className="flex justify-between"><span>Tạm tính</span><b>{currency(selectedOrder.subtotal)}</b></div>
            <div className="flex justify-between"><span>Giảm</span><b>{currency(selectedOrder.discount_amount)}</b></div>
            <div className="flex justify-between"><span>Phí vận chuyển</span><b>{currency(selectedOrder.shipping_fee)}</b></div>
            <div className="flex justify-between"><span>Thành tiền</span><b>{currency(selectedOrder.total_amount)}</b></div>
            <div className="mt-4">
              <b>Danh sách sản phẩm</b>
              <ul className="list-disc pl-5 mt-2">
                {(selectedOrder.items || []).map((i) => (
                  <li key={`${i.product_id}`}>{i.product_name} x{i.quantity} — {currency(i.subtotal)}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
};

export default AdminOrdersPage;
