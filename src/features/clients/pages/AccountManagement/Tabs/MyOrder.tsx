import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Drawer, Input, Modal, Space, Table, Tag, Typography, message, Select } from 'antd';
import { useOrder } from '@/hooks/useOrder';
import { formatDateVN } from '@/utils/date';
import { useAppSelector } from '@/hooks/redux';
import { selectMyOrderPageMeta } from '@/stores/selectors/order.selector';

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

const MyOrder: React.FC = () => {
  const {
    isLoading,
    error,
    myOrders,
    fetchMyOrders,
    fetchOrderById,
    selectedOrder,
    checkoutOrder,
    cancelOrder,
    confirmDelivery,
    applyCouponToOrder,
    removeCouponFromOrder,
  } = useOrder();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => { if (error) message.error(error); }, [error]);

  const load = useCallback(() => {
    fetchMyOrders({ page, limit: pageSize, sortBy: 'createdAt', sortType: 'desc' });
  }, [page, pageSize, fetchMyOrders]);

  useEffect(() => { load(); }, [load]);

  const rawData = useMemo(() => Array.isArray(myOrders?.content) ? myOrders!.content : [], [myOrders]);
  const data = useMemo(() => {
    return rawData.filter(o => {
      const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const kw = search.trim().toLowerCase();
      const matchSearch = !kw || o.id.toLowerCase().includes(kw) || o.shop?.shop_name?.toLowerCase().includes(kw) || (o.items || []).some(it => it.product_name.toLowerCase().includes(kw));
      return matchStatus && matchSearch;
    });
  }, [rawData, statusFilter, search]);
  const myMeta = useAppSelector(selectMyOrderPageMeta);

  const doCheckout = async (id: string) => {
    await checkoutOrder(id, { paymentMethod: 'COD' }).unwrap();
    message.success('Đã xác nhận đặt hàng');
    load();
  };
  const doCancel = async (id: string) => {
    await cancelOrder(id).unwrap();
    message.success('Đã hủy đơn');
    load();
  };
  const doConfirmDelivery = async (id: string) => {
    await confirmDelivery(id).unwrap();
    message.success('Đã xác nhận nhận hàng');
    load();
  };

  const columns = [
    {
      title: 'Đơn',
      dataIndex: 'id',
      key: 'id',
      width: 220,
      render: (_: any, r: IOrder) => (
        <Space direction="vertical" size={2}>
          <span className="font-medium">{r.id}</span>
          <span className="text-xs text-gray-500">{formatDateVN(r.created_at)}</span>
        </Space>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'items',
      width: 280,
      render: (_: any, r: IOrder) => {
        const items = r.items || [];
        const first = items[0];
        return (
          <Space direction="vertical" size={2}>
            {first && <span>{first.product_name} x{first.quantity}</span>}
            {items.length > 1 && <span className="text-xs text-gray-500">+ {items.length - 1} sản phẩm khác</span>}
          </Space>
        );
      },
    },
    { title: 'Cửa hàng', key: 'shop', width: 180, render: (_: any, r: IOrder) => <span>{r.shop?.shop_name}</span> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120, render: (s: OrderStatus) => <Tag color={statusColor[s]}>{s}</Tag> },
    {
      title: 'Thanh toán',
      key: 'payment',
      width: 140,
      render: (_: any, r: IOrder) => (
        <Space size={4} direction="vertical">
          <span>{r.payment_method}</span>
          {r.is_paid ? <Tag color="green">Đã trả</Tag> : <Tag color="volcano">Chưa trả</Tag>}
        </Space>
      ),
    },
    { title: 'Tổng tiền', dataIndex: 'total_amount', key: 'total_amount', align: 'right', width: 140, render: currency },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right' as const,
      width: 300,
      render: (_: any, r: IOrder) => (
        <Space size="small">
          <Button size="small" onClick={() => { fetchOrderById(r.id); setOpen(true); }}>Chi tiết</Button>
          {r.status === 'PENDING' && (
            <>
              <Button size="small" type="primary" className="!bg-blue-600" onClick={() => doCheckout(r.id)}>Checkout</Button>
              <Button size="small" onClick={() => { setCouponCode(''); setApplyOpen(true); fetchOrderById(r.id); }}>Áp mã</Button>
              {r.coupon_code && <Button size="small" danger onClick={() => removeCouponFromOrder(r.id)}>Bỏ mã</Button>}
              <Button size="small" danger onClick={() => doCancel(r.id)}>Hủy</Button>
            </>
          )}
          {r.status === 'SHIPPING' && (
            <Button size="small" type="primary" className="!bg-green-600" onClick={() => doConfirmDelivery(r.id)}>Đã nhận</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>Đơn hàng của tôi</Title>
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <Input
          allowClear
          placeholder="Tìm (mã đơn / cửa hàng / sản phẩm)"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ width: 280 }}
          size="small"
        />
        <Select
          size="small"
          value={statusFilter}
          style={{ width: 160 }}
          onChange={(v) => { setStatusFilter(v as any); setPage(1); }}
          options={[{ value: 'ALL', label: 'Tất cả trạng thái' }, ...Object.keys(statusColor).map(s => ({ value: s, label: s }))]}
        />
        <span className="text-xs text-gray-500">Hiển thị {data.length} / {rawData.length} đơn</span>
      </div>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data}
        columns={columns as any}
        size="middle"
        scroll={{ x: 1200 }}
        pagination={{ current: page, pageSize, total: myMeta.totalElements, showSizeChanger: true }}
        onChange={(p) => { setPage(p.current || 1); setPageSize(p.pageSize || 10); }}
      />

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

      <Modal
        title="Áp dụng mã giảm giá"
        open={applyOpen}
        onCancel={() => setApplyOpen(false)}
        onOk={async () => {
          if (!selectedOrder?.id || !couponCode.trim()) return;
          await applyCouponToOrder(selectedOrder.id, { code: couponCode.trim() }).unwrap();
          message.success('Đã áp dụng mã');
          setApplyOpen(false);
          load();
        }}
        okText="Áp dụng"
        cancelText="Hủy"
      >
        <Input placeholder="Nhập mã" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
      </Modal>
    </div>
  );
};

export default MyOrder;
