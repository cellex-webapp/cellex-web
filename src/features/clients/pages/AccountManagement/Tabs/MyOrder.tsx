import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Drawer, Input, Modal, Space, Table, Tag, Typography, message, Select, Avatar, Divider, Card, Tooltip } from 'antd';
import { EyeOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useOrder } from '@/hooks/useOrder';
import { formatDateVN } from '@/utils/date';
import { useAppSelector } from '@/hooks/redux';
import { selectMyOrderPageMeta } from '@/stores/selectors/order.selector';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = {
  PENDING: 'gold',
  CONFIRMED: 'blue',
  SHIPPING: 'geekblue',
  DELIVERED: 'green',
  CANCELLED: 'red',
};

const statusLabel: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

const currency = (n?: number) =>
  typeof n === 'number'
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
    : '0 ₫';

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
      const matchSearch = !kw || 
        o.id.toLowerCase().includes(kw) || 
        o.shop?.shop_name?.toLowerCase().includes(kw) || 
        (o.items || []).some(it => it.product_name.toLowerCase().includes(kw));
      return matchStatus && matchSearch;
    });
  }, [rawData, statusFilter, search]);

  const myMeta = useAppSelector(selectMyOrderPageMeta);

  // Actions
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
      title: 'Thông tin đơn hàng',
      key: 'info',
      width: 280,
      render: (_: any, r: IOrder) => (
        <Space align="start" size={12}>
          <Avatar 
            shape="square" 
            size={48} 
            src={r.items?.[0]?.product_image} 
            className="bg-gray-100 border border-gray-200"
          />
          <Space direction="vertical" size={0}>
            <Text strong className="text-gray-700">{r.id}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{formatDateVN(r.created_at)}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{r.shop?.shop_name}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'items',
      width: 250,
      render: (_: any, r: IOrder) => {
        const items = r.items || [];
        const first = items[0];
        return (
          <Space direction="vertical" size={2} className="w-full">
            {first && (
              <Text ellipsis className="max-w-[220px]" title={first.product_name}>
                {first.product_name} <Text type="secondary">x{first.quantity}</Text>
              </Text>
            )}
            {items.length > 1 && (
              <Tag className="!mr-0 w-fit text-xs">
                + {items.length - 1} sản phẩm khác
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 140,
      align: 'right' as const,
      render: (val: number) => <Text strong className="text-blue-600">{currency(val)}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center' as const,
      render: (s: string) => (
        <Tag color={statusColor[s] || 'default'} className="min-w-[90px] text-center font-medium border-0 py-0.5">
          {statusLabel[s] || s}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right' as const,
      width: 80,
      align: 'center' as const,
      render: (_: any, r: IOrder) => (
        <Tooltip title="Xem chi tiết">
          <Button 
            type="text" 
            icon={<EyeOutlined className="text-gray-500" />} 
            onClick={() => { fetchOrderById(r.id); setOpen(true); }}
            className="hover:!text-blue-600 hover:!bg-blue-50"
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Space direction="vertical" size="large" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Title level={3} className="!mb-0">Đơn hàng của tôi</Title>
            <Text type="secondary">Quản lý và theo dõi trạng thái đơn hàng</Text>
          </div>
          <Space>
             {/* Thêm các button global actions nếu cần */}
          </Space>
        </div>

        <Card 
          bordered={false} 
          className="shadow-sm rounded-lg overflow-hidden" 
          bodyStyle={{ padding: '0' }} // Reset padding card để table full width đẹp hơn
        >
          {/* Filter Section */}
          <div className="p-5 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-white">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
              placeholder="Tìm theo mã đơn, sản phẩm..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ width: 300 }}
              className="rounded-md"
            />
            <Select
              suffixIcon={<FilterOutlined className="text-gray-400" />}
              value={statusFilter}
              style={{ width: 180 }}
              onChange={(v) => { setStatusFilter(v as any); setPage(1); }}
              options={[{ value: 'ALL', label: 'Tất cả trạng thái' }, ...Object.keys(statusColor).map(s => ({ value: s, label: statusLabel[s] || s }))]}
            />
          </div>

          {/* Table */}
          <Table
            rowKey="id"
            loading={isLoading}
            dataSource={data}
            columns={columns as any}
            size="middle" // Dùng middle để cân đối, không quá to như default
            scroll={{ x: 1000 }}
            pagination={{ 
              current: page, 
              pageSize, 
              total: myMeta.totalElements, 
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} đơn hàng`,
              className: "p-4 !m-0 flex justify-end" // Padding cho pagination
            }}
            onChange={(p) => { setPage(p.current || 1); setPageSize(p.pageSize || 10); }}
          />
        </Card>
      </Space>

      {/* Drawer Chi tiết */}
      <Drawer 
        title={<span className="font-bold text-lg">Chi tiết đơn hàng</span>} 
        placement="right" 
        width={600} 
        onClose={() => setOpen(false)} 
        open={open}
        extra={<Tag color={statusColor[selectedOrder?.status || '']}>{statusLabel[selectedOrder?.status || ''] || selectedOrder?.status}</Tag>}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Info Section */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <Text type="secondary" className="text-xs uppercase block mb-1">Mã đơn hàng</Text>
                <Text strong copyable>{selectedOrder.id}</Text>
              </div>
              <div>
                <Text type="secondary" className="text-xs uppercase block mb-1">Ngày đặt</Text>
                <Text>{formatDateVN(selectedOrder.created_at)}</Text>
              </div>
              <div>
                <Text type="secondary" className="text-xs uppercase block mb-1">Cửa hàng</Text>
                <Text className="text-blue-600">{selectedOrder.shop_name}</Text>
              </div>
               <div>
                <Text type="secondary" className="text-xs uppercase block mb-1">Thanh toán</Text>
                <Text>{selectedOrder.payment_method}</Text>
              </div>
            </div>

            {/* Items Section */}
            <div>
              <Text strong className="block mb-3">Sản phẩm ({selectedOrder.items?.length})</Text>
              <div className="border rounded-lg divide-y">
                {(selectedOrder.items || []).map((i) => (
                  <div key={i.product_id} className="p-3 flex items-start gap-3">
                    <Avatar shape="square" size={48} src={i.product_image} className="bg-gray-100" />
                    <div className="flex-1">
                      <Text className="block mb-0.5 font-medium">{i.product_name}</Text>
                      <div className="flex justify-between text-sm">
                        <Text type="secondary">x{i.quantity}</Text>
                        <Text strong>{currency(i.subtotal)}</Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Section */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-gray-500"><span>Tạm tính</span><span>{currency(selectedOrder.subtotal)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Giảm giá</span><span>- {currency(selectedOrder.discount_amount)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Phí vận chuyển</span><span>+ {currency(selectedOrder.shipping_fee)}</span></div>
              <Divider className="my-2" />
              <div className="flex justify-between items-center">
                <Text strong className="text-lg">Tổng cộng</Text>
                <Text strong className="text-xl text-blue-600">{currency(selectedOrder.total_amount)}</Text>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 grid grid-cols-2 gap-3">
               {selectedOrder.status === 'PENDING' && (
                 <>
                   <Button block type="primary" size="large" onClick={() => doCheckout(selectedOrder.id)}>Thanh toán ngay</Button>
                   <Button block danger size="large" onClick={() => doCancel(selectedOrder.id)}>Hủy đơn</Button>
                   {/* <Button block onClick={() => { setCouponCode(''); setApplyOpen(true); }}>Áp mã giảm giá</Button> */}
                   {selectedOrder.coupon_code && <Button block danger onClick={() => removeCouponFromOrder(selectedOrder.id)}>Gỡ mã</Button>}
                 </>
               )}
               {selectedOrder.status === 'SHIPPING' && (
                 <Button block type="primary" className="col-span-2 !bg-green-600" size="large" onClick={() => doConfirmDelivery(selectedOrder.id)}>
                   Đã nhận được hàng
                 </Button>
               )}
            </div>
          </div>
        )}
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
        cancelText="Đóng"
        centered
      >
        <div className="py-4">
           <Input 
             size="large" 
             placeholder="Nhập mã voucher (VD: SUMMER2024)" 
             value={couponCode} 
             onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
             prefix={<Tag color="blue">VOUCHER</Tag>}
           />
        </div>
      </Modal>
    </div>
  );
};

export default MyOrder;