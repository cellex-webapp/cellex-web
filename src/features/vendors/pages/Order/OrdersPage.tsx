import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  Button, Drawer, Table, Tag, Typography, message, Space, 
  Popconfirm, Card, Tooltip, Avatar, Divider, Tabs, Input 
} from 'antd';
import { 
  EyeOutlined, SearchOutlined, ShoppingCartOutlined 
} from '@ant-design/icons';
import { useOrder } from '@/hooks/useOrder';
import { formatDateVN } from '@/utils/date';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux';
import { selectShopOrderPageMeta } from '@/stores/selectors/order.selector';

const { Title, Text } = Typography;

const statusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'gold', label: 'Chờ xác nhận' },
  CONFIRMED: { color: 'blue', label: 'Đã xác nhận' },
  SHIPPING: { color: 'geekblue', label: 'Đang giao' },
  DELIVERED: { color: 'green', label: 'Đã giao' },
  CANCELLED: { color: 'red', label: 'Đã hủy' },
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
      list = list.filter(item => item.id.toLowerCase().includes(searchId.toLowerCase()));
    }
    return list;
  }, [shopOrders, searchId]);

  const doConfirm = async (id: string) => {
    await vendorConfirmOrder(id).unwrap();
    message.success('Đã xác nhận đơn hàng');
    load();
    setOpen(false); // Đóng drawer sau khi xử lý xong
  };

  const doShip = async (id: string) => {
    await vendorShipOrder(id).unwrap();
    message.success('Đã chuyển trạng thái giao hàng');
    load();
    setOpen(false);
  };

  const columns = [
    { 
      title: 'Mã đơn / Ngày tạo', 
      key: 'info', 
      width: 200,
      render: (_: any, r: IOrder) => (
        <Space direction="vertical" size={0}>
          <Text strong copyable className="text-gray-700">{r.id}</Text>
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
        return <Tag color={conf.color} className="font-medium min-w-[100px] text-center">{conf.label}</Tag>;
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
                    <div className="font-medium">{selectedOrder.id}</div>
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
                 <Popconfirm 
                    title="Xác nhận gửi hàng" 
                    description="Xác nhận đã bàn giao cho đơn vị vận chuyển?"
                    onConfirm={() => doShip(selectedOrder.id)}
                    okText="Đồng ý"
                    cancelText="Hủy"
                 >
                    <Button type="primary" size="large" block className="!bg-indigo-600 h-12 text-base font-medium shadow-md hover:!bg-indigo-500">
                      Đã gửi hàng cho shipper
                    </Button>
                 </Popconfirm>
               )}

               {['SHIPPING', 'DELIVERED', 'CANCELLED'].includes(selectedOrder.status) && (
                 <div className="text-center text-gray-400 py-2 bg-gray-50 rounded italic border border-dashed">
                   Đơn hàng đang ở trạng thái {statusConfig[selectedOrder.status]?.label}. Không có hành động nào.
                 </div>
               )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default VendorOrdersPage;