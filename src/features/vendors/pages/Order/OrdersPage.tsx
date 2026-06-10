import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  Button, Drawer, Table, Tag, Typography, message, Space, 
  Popconfirm, Card, Tooltip, Avatar, Divider, Tabs, Input, Form, InputNumber, Modal, Timeline
} from 'antd';
import { 
  EyeOutlined, SearchOutlined, ShoppingCartOutlined, CarOutlined, CodeSandboxOutlined
} from '@ant-design/icons';
import { useOrder } from '@/hooks/useOrder';
import { formatDateVN } from '@/utils/date';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux';
import { selectShopOrderPageMeta } from '@/stores/selectors/order.selector';
import orderService from '@/services/order.service';
import axiosInstance from '@/utils/axiosInstance';

const { Title, Text } = Typography;

const statusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'gold', label: 'Chờ xác nhận' },
  CONFIRMED: { color: 'blue', label: 'Đã xác nhận' },
  READY_TO_SHIP: { color: 'cyan', label: 'Chờ lấy hàng' },
  SHIPPING: { color: 'geekblue', label: 'Đang giao' },
  DELIVERED: { color: 'green', label: 'Đã giao' },
  CANCELLED: { color: 'red', label: 'Đã hủy' },
  DELIVERY_FAILED: { color: 'volcano', label: 'Giao thất bại' },
  RETURNING: { color: 'orange', label: 'Đang hoàn trả' },
  RETURNED: { color: 'magenta', label: 'Đã hoàn trả' },
};

const currency = (n?: number) =>
  typeof n === 'number'
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
    : '0 ₫';

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
  const shopMeta = useAppSelector(selectShopOrderPageMeta);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [open, setOpen] = useState(false);
  const [searchId, setSearchId] = useState('');
  
  // GHN States
  const [isPrepareModalOpen, setIsPrepareModalOpen] = useState(false);
  const [prepareForm] = Form.useForm();
  const [trackingEvents, setTrackingEvents] = useState<any[]>([]);
  const [isFetchingTracking, setIsFetchingTracking] = useState(false);

  useEffect(() => { if (error) message.error(error); }, [error]);

  useEffect(() => {
    if (location.pathname.endsWith('/shipping')) {
      setStatus('SHIPPING');
    }
  }, [location.pathname]);

  const load = useCallback(() => {
    const params = { page, limit: pageSize, sortBy: 'createdAt', sortType: 'desc' };
    if (status === 'ALL') {
      fetchShopOrders(params);
    } else {
      fetchShopOrdersByStatus(status as OrderStatus, params);
    }
  }, [status, page, pageSize, fetchShopOrders, fetchShopOrdersByStatus]);

  useEffect(() => { load(); }, [load]);

  const data = useMemo(() => {
    let list = Array.isArray(shopOrders?.content) ? shopOrders!.content : [];
    if (searchId) {
      list = list.filter(item => 
        item.order_code?.toLowerCase().includes(searchId.toLowerCase()) ||
        item.id.toLowerCase().includes(searchId.toLowerCase())
      );
    }
    return list;
  }, [shopOrders, searchId]);

  const doConfirm = async (id: string) => {
    await vendorConfirmOrder(id).unwrap();
    message.success('Đã xác nhận đơn hàng');
    load();
    setOpen(false); // Đóng drawer sau khi xử lý xong
  };

  useEffect(() => {
    if (open && selectedOrder && ['READY_TO_SHIP', 'SHIPPING', 'DELIVERED', 'DELIVERY_FAILED', 'RETURNING', 'RETURNED'].includes(selectedOrder.status)) {
      fetchTracking(selectedOrder.id);
    }
  }, [open, selectedOrder]);

  const fetchTracking = async (orderId: string) => {
    setIsFetchingTracking(true);
    try {
      const resp = await orderService.getTracking(orderId);
      setTrackingEvents(resp.data || []);
    } catch (err: any) {
      console.error('Failed to fetch tracking', err);
    } finally {
      setIsFetchingTracking(false);
    }
  };

  const doPrepareShipment = async (values: any) => {
    if (!selectedOrder) return;
    try {
      await orderService.prepareShipment(selectedOrder.id, values);
      message.success('Đã gửi thông tin cho GHN thành công!');
      setIsPrepareModalOpen(false);
      load();
      setOpen(false);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi khi chuẩn bị hàng');
    }
  };

  const mockWebhook = async (status: string, description: string) => {
    if (!selectedOrder?.ghn_order_code) {
      message.error('Đơn hàng chưa có mã vận đơn GHN');
      return;
    }
    try {
      await axiosInstance.post('/webhooks/ghn', {
        OrderCode: selectedOrder.ghn_order_code,
        ClientOrderCode: selectedOrder.id,
        Status: status,
        Description: description,
        Warehouse: 'Kho Test Local',
        Time: new Date().toISOString()
      });
      message.success('Đã giả lập Webhook thành công!');
      load();
      fetchTracking(selectedOrder.id);
    } catch (err: any) {
      message.error('Lỗi giả lập Webhook');
    }
  };

  const columns = [
    { 
      title: 'Mã đơn / Ngày tạo', 
      key: 'info', 
      width: 200,
      render: (_: any, r: IOrder) => (
        <Space direction="vertical" size={0}>
          <Text strong copyable className="text-gray-700">{r.order_code || r.id}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{formatDateVN(r.created_at)}</Text>
        </Space>
      )
    },
    { 
      title: 'Sản phẩm', 
      key: 'items', 
      width: 300,
      render: (_: any, r: IOrder) => {
        const items = r.items || [];
        const firstItem = items[0];
        if (!firstItem) return <Text type="secondary">Không có sản phẩm</Text>;

        return (
          <div className="flex items-center gap-3">
            <Avatar 
              shape="square" 
              size={48} 
              src={firstItem.product_image} 
              icon={<ShoppingCartOutlined />} 
              className="bg-gray-100 flex-shrink-0 border border-gray-200"
            />
            <div className="flex flex-col overflow-hidden">
              <Text ellipsis className="max-w-[180px] font-medium" title={firstItem.product_name}>
                {firstItem.product_name}
              </Text>
              <div className="flex items-center gap-2">
                 <Text type="secondary" style={{ fontSize: 12 }}>x{firstItem.quantity}</Text>
                 {items.length > 1 && (
                   <Tag className="m-0 text-[10px] leading-4 px-1 bg-gray-100 border-gray-300 text-gray-500">
                     +{items.length - 1} khác
                   </Tag>
                 )}
              </div>
            </div>
          </div>
        );
      }
    },
    { 
      title: 'Tổng tiền', 
      dataIndex: 'total_amount', 
      key: 'total_amount', 
      render: (v: number) => <Text strong className="text-blue-600">{currency(v)}</Text>, 
      align: 'right' as const, 
      width: 140 
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status', 
      width: 140,
      align: 'center' as const,
      render: (s: string) => {
        const conf = statusConfig[s] || { color: 'default', label: s };
        return <Tag color={conf.color} className="font-medium text-center">{conf.label}</Tag>;
      }
    },
    {
      title: 'Chi tiết',
      key: 'actions',
      fixed: 'right' as const,
      width: 80,
      align: 'center' as const,
      render: (_: any, r: IOrder) => (
        <Tooltip title="Xem chi tiết & Xử lý">
          <Button 
            type="text" 
            shape="circle"
            icon={<EyeOutlined className="text-gray-500 hover:text-blue-600" />} 
            onClick={() => { fetchOrderById(r.id); setOpen(true); }} 
          />
        </Tooltip>
      ),
    },
  ];

  const tabItems = [
    { key: 'ALL', label: 'Tất cả' },
    ...Object.keys(statusConfig).map(key => ({ 
      key, 
      label: statusConfig[key].label 
    }))
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen bg-gray-50">
      <Space direction="vertical" size="large" className="w-full">
        <div>
          <Title level={3} className="!mb-0">Quản lý Đơn hàng</Title>
          <Text type="secondary">Xử lý đơn hàng và vận chuyển</Text>
        </div>

        <Card bordered={false} className="shadow-sm rounded-lg overflow-hidden" bodyStyle={{ padding: 0 }}>
          <div className="p-4 border-b border-gray-100 bg-white">
             <Tabs 
                activeKey={status} 
                onChange={(k) => { 
                  setStatus(k as any); 
                  setPage(1);
                  if (k === 'SHIPPING') navigate('/vendor/orders/shipping'); 
                  else navigate('/vendor/orders'); 
                }}
                items={tabItems}
                className="!mb-0"
             />
             <div className="mt-4">
                <Input 
                  prefix={<SearchOutlined className="text-gray-400"/>} 
                  placeholder="Tìm theo mã đơn hàng..." 
                  style={{ maxWidth: 320 }}
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  allowClear
                />
             </div>
          </div>

          <Table
            rowKey="id"
            loading={isLoading}
            dataSource={data}
            columns={columns as any}
            pagination={{ 
              current: page, 
              pageSize, 
              total: shopMeta.totalElements, 
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} đơn`,
              className: "p-4"
            }}
            onChange={(p) => { setPage(p.current || 1); setPageSize(p.pageSize || 10); }}
            size="middle"
            scroll={{ x: 1000 }}
          />
        </Card>
      </Space>

      {/* Drawer Chi Tiết & Hành Động */}
      <Drawer 
        title={<span className="font-bold text-lg">Chi tiết đơn hàng</span>} 
        placement="right" 
        width={600} 
        onClose={() => setOpen(false)} 
        open={open}
        extra={selectedOrder && (
          <Tag color={statusConfig[selectedOrder.status]?.color || 'default'}>
            {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
          </Tag>
        )}
      >
        {selectedOrder && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* Thông tin chung */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                 <div className="bg-gray-50 p-3 rounded border">
                    <div className="text-gray-500 mb-1">Mã đơn hàng</div>
                    <div className="font-medium">{selectedOrder.order_code || selectedOrder.id}</div>
                 </div>
                 <div className="bg-gray-50 p-3 rounded border">
                    <div className="text-gray-500 mb-1">Ngày đặt</div>
                    <div className="font-medium">{formatDateVN(selectedOrder.created_at)}</div>
                 </div>
                 <div className="bg-gray-50 p-3 rounded border">
                    <div className="text-gray-500 mb-1">Thanh toán</div>
                    <div className="font-medium">{selectedOrder.payment_method}</div>
                 </div>
                 <div className="bg-gray-50 p-3 rounded border">
                    <div className="text-gray-500 mb-1">Khách hàng</div>
                    {/* Giả sử có thông tin khách hàng, nếu không có để trống */}
                    <div className="font-medium">Khách lẻ</div> 
                 </div>
              </div>

              {/* Danh sách sản phẩm chi tiết */}
              <div>
                <h4 className="font-bold mb-3">Sản phẩm ({selectedOrder.items?.length})</h4>
                <div className="border rounded-lg divide-y">
                  {(selectedOrder.items || []).map((i) => (
                    <div key={i.product_id} className="p-3 flex gap-4">
                      <Avatar 
                        shape="square" 
                        size={64} 
                        src={i.product_image} 
                        icon={<ShoppingCartOutlined />}
                        className="bg-gray-100 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 line-clamp-2">{i.product_name}</div>
                        <div className="flex justify-between items-end mt-2">
                           <div className="text-gray-500 text-sm">x{i.quantity}</div>
                           <div className="font-bold">{currency(i.subtotal)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tổng kết tài chính */}
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm"><span>Tạm tính</span><span>{currency(selectedOrder.subtotal)}</span></div>
                <div className="flex justify-between text-sm text-green-600"><span>Giảm giá</span><span>- {currency(selectedOrder.discount_amount)}</span></div>
                <div className="flex justify-between text-sm"><span>Phí vận chuyển</span><span>+ {currency(selectedOrder.shipping_fee)}</span></div>
                <Divider className="my-2 bg-blue-200"/>
                <div className="flex justify-between items-center font-bold text-lg text-blue-800">
                  <span>Tổng thực thu</span>
                  <span>{currency(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Khu vực nút bấm xử lý đơn hàng */}
            <div className="pt-4 mt-4 border-t bg-white">
               {selectedOrder.status === 'PENDING' && (
                 <Popconfirm 
                    title="Xác nhận đơn hàng" 
                    description="Bạn có chắc chắn muốn xác nhận đơn hàng này để chuẩn bị đóng gói?"
                    onConfirm={() => doConfirm(selectedOrder.id)}
                    okText="Đồng ý"
                    cancelText="Hủy"
                 >
                    <Button type="primary" size="large" block className="!bg-blue-600 h-12 text-base font-medium shadow-md hover:!bg-blue-500">
                      Xác nhận đơn hàng
                    </Button>
                 </Popconfirm>
               )}
               
               {selectedOrder.status === 'CONFIRMED' && (
                 <Button type="primary" size="large" block icon={<CarOutlined />} className="!bg-indigo-600 h-12 text-base font-medium shadow-md hover:!bg-indigo-500" onClick={() => setIsPrepareModalOpen(true)}>
                   Chuẩn bị hàng (Gọi GHN)
                 </Button>
               )}

               {/* Tracking & Webhook Mock */}
               {['READY_TO_SHIP', 'SHIPPING', 'DELIVERED', 'DELIVERY_FAILED', 'RETURNING', 'RETURNED'].includes(selectedOrder.status) && (
                 <div className="mt-6 pt-4 border-t">
                   <div className="flex justify-between items-center mb-4">
                     <h4 className="font-bold">Lịch trình vận chuyển GHN</h4>
                     <Tag color="blue">{selectedOrder.ghn_order_code}</Tag>
                   </div>
                   
                   {/* Giả lập Webhook cho môi trường Dev */}
                   <div className="bg-gray-100 p-3 rounded-lg mb-4">
                     <div className="text-xs text-gray-500 mb-2 font-bold"><CodeSandboxOutlined /> TEST WEBHOOK (CHỈ MÔI TRƯỜNG DEV)</div>
                     <Space wrap>
                       <Button size="small" onClick={() => mockWebhook('picking', 'Shipper đang đi lấy hàng')}>Picking</Button>
                       <Button size="small" onClick={() => mockWebhook('delivering', 'Đang giao hàng')}>Delivering</Button>
                       <Button size="small" type="primary" className="!bg-green-600" onClick={() => mockWebhook('delivered', 'Giao thành công')}>Delivered</Button>
                       <Button size="small" danger onClick={() => mockWebhook('return', 'Khách không nhận hàng')}>Return</Button>
                     </Space>
                   </div>

                   {isFetchingTracking ? (
                     <div className="text-center text-gray-400 py-4">Đang tải hành trình...</div>
                   ) : trackingEvents.length > 0 ? (
                     <Timeline 
                       items={trackingEvents.map((evt: any, idx: number) => ({
                         color: idx === 0 ? 'green' : 'gray',
                         children: (
                           <div>
                             <div className="font-medium text-sm">{evt.description}</div>
                             <div className="text-xs text-gray-500">{formatDateVN(evt.timestamp)} - {evt.warehouse}</div>
                           </div>
                         )
                       }))}
                     />
                   ) : (
                     <div className="text-center text-gray-400 py-4 italic">Chưa có thông tin hành trình</div>
                   )}
                 </div>
               )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Modal Chuẩn bị giao hàng */}
      <Modal
        title="Thông tin gói hàng (GHN)"
        open={isPrepareModalOpen}
        onCancel={() => setIsPrepareModalOpen(false)}
        onOk={() => prepareForm.submit()}
        okText="Gửi thông tin cho GHN"
        cancelText="Hủy"
      >
        <Form
          form={prepareForm}
          layout="vertical"
          onFinish={doPrepareShipment}
          initialValues={{ weight: 500, length: 20, width: 15, height: 10 }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="weight" label="Trọng lượng (gram)" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item name="length" label="Chiều dài (cm)" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item name="width" label="Chiều rộng (cm)" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item name="height" label="Chiều cao (cm)" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </div>
          <Form.Item name="note" label="Ghi chú (Không bắt buộc)">
            <Input.TextArea placeholder="Ví dụ: Hàng dễ vỡ, xin nhẹ tay..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VendorOrdersPage;