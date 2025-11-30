import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Drawer, Input, Modal, Space, Table, Tag, Typography, message } from 'antd';
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

  useEffect(() => { if (error) message.error(error); }, [error]);

  const load = useCallback(() => {
    fetchMyOrders({ page, limit: pageSize, sortBy: 'createdAt', sortType: 'desc' });
  }, [page, pageSize, fetchMyOrders]);

  useEffect(() => { load(); }, [load]);

  const data = useMemo(() => Array.isArray(myOrders?.content) ? myOrders!.content : [], [myOrders]);
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
    { title: 'Mã đơn', dataIndex: 'id', key: 'id', width: 240 },
    { title: 'Cửa hàng', dataIndex: 'shop_name', key: 'shop_name', width: 200 },
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
      width: 360,
    },
  ];

  return (
    <div>
      <Title level={4}>Đơn hàng của tôi</Title>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data}
        columns={columns as any}
        size="middle"
        scroll={{ x: 1100 }}
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
