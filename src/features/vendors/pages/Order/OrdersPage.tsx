import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Drawer, Select, Table, Tag, Typography, message, Space, Popconfirm } from 'antd';
import { useOrder } from '@/hooks/useOrder';
import { formatDateVN } from '@/utils/date';
import { useLocation, useNavigate } from 'react-router-dom';

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

const VendorOrdersPage: React.FC = () => {
  const {
    isLoading,
    error,
    shopOrders,
    fetchShopOrders,
    fetchShopOrdersByStatus,
    fetchOrderById,
    selectedOrder,
    vendorConfirmOrder,
    vendorShipOrder,
  } = useOrder();
  const navigate = useNavigate();
  const location = useLocation();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [open, setOpen] = useState(false);

  useEffect(() => { if (error) message.error(error); }, [error]);

  useEffect(() => {
    if (location.pathname.endsWith('/shipping')) {
      setStatus('SHIPPING');
    }
  }, [location.pathname]);

  const load = useCallback(() => {
    if (status === 'ALL') {
      fetchShopOrders({ page, limit: pageSize, sortBy: 'createdAt', sortType: 'desc' });
    } else {
      fetchShopOrdersByStatus(status as OrderStatus, { page, limit: pageSize, sortBy: 'createdAt', sortType: 'desc' });
    }
  }, [status, page, pageSize, fetchShopOrders, fetchShopOrdersByStatus]);

  useEffect(() => { load(); }, [load]);

  const data = useMemo(() => (Array.isArray(shopOrders?.content) ? shopOrders!.content : []), [shopOrders]);

  const doConfirm = async (id: string) => {
    await vendorConfirmOrder(id).unwrap();
    message.success('Đã xác nhận đơn');
    load();
  };
  const doShip = async (id: string) => {
    await vendorShipOrder(id).unwrap();
    message.success('Đã xác nhận gửi hàng');
    load();
  };

  const columns = [
    { title: 'Mã đơn', dataIndex: 'id', key: 'id', width: 240 },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s: OrderStatus) => <Tag color={statusColor[s]}>{s}</Tag>, width: 120 },
    { title: 'Tạm tính', dataIndex: 'subtotal', key: 'subtotal', render: currency, align: 'right', width: 140 },
    { title: 'Giảm', dataIndex: 'discount_amount', key: 'discount_amount', render: currency, align: 'right', width: 120 },
    { title: 'Thành tiền', dataIndex: 'total_amount', key: 'total_amount', render: currency, align: 'right', width: 140 },
    { title: 'Tạo lúc', dataIndex: 'created_at', key: 'created_at', render: (v: string) => formatDateVN(v), width: 180 },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right' as const,
      render: (_: any, r: IOrder) => (
        <Space size="small">
          <Button size="small" onClick={() => { fetchOrderById(r.id); setOpen(true); }}>Chi tiết</Button>
          {r.status === 'PENDING' && (
            <Popconfirm title="Xác nhận đơn?" onConfirm={() => doConfirm(r.id)}>
              <Button size="small" type="primary" className="!bg-blue-600">Xác nhận</Button>
            </Popconfirm>
          )}
          {r.status === 'CONFIRMED' && (
            <Popconfirm title="Đánh dấu đã gửi?" onConfirm={() => doShip(r.id)}>
              <Button size="small" type="primary" className="!bg-indigo-600">Gửi hàng</Button>
            </Popconfirm>
          )}
        </Space>
      ),
      width: 220,
    },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center justify-between">
          <Title level={4}>Đơn hàng của shop</Title>
        </div>
        <div className="my-3 flex items-center gap-2">
          <Select
            value={status}
            onChange={(v) => { setStatus(v as any); setPage(1); if (v === 'SHIPPING') navigate('/vendor/orders/shipping'); else navigate('/vendor/orders'); }}
            style={{ width: 220 }}
            options={[{ value: 'ALL', label: 'Tất cả' }, 'PENDING','CONFIRMED','SHIPPING','DELIVERED','CANCELLED'].map((s: any) => ({ value: s, label: String(s) }))}
          />
        </div>

        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={data}
          columns={columns as any}
          pagination={{ current: page, pageSize, total: shopOrders?.totalElements || 0, showSizeChanger: true }}
          onChange={(p) => { setPage(p.current || 1); setPageSize(p.pageSize || 10); }}
          size="middle"
          scroll={{ x: 900 }}
        />
      </div>

      <Drawer title={`Chi tiết đơn ${selectedOrder?.id || ''}`} placement="right" width={560} onClose={() => setOpen(false)} open={open}>
        {selectedOrder ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Trạng thái</span>
              <Tag color={statusColor[selectedOrder.status]}>{selectedOrder.status}</Tag>
            </div>
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

export default VendorOrdersPage;
