import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Drawer,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
  Divider,
  Tooltip,
  Descriptions,
  List,
  Avatar,
  Timeline,
  Card,
  Row,
  Col
} from 'antd';
import {
  InfoCircleOutlined,
  UserOutlined,
  ShopOutlined,
  ShoppingOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useOrder } from '@/hooks/useOrder';
import { formatDateVN } from '@/utils/date';
import { useAppSelector } from '@/hooks/redux';
import { selectAdminOrderPageMeta } from '@/stores/selectors/order.selector';

const { Text, Title } = Typography;

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
  const adminMeta = useAppSelector(selectAdminOrderPageMeta);
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
    {
      title: 'User',
      key: 'user_id',
      width: 180,
      render: (_: any, r: IOrder) => (
        <span>{r.user?.fullName ? `${r.user.fullName}` : r.user?.id || ''}</span>
      ),
    },
    {
      title: 'Shop',
      key: 'shop_name',
      width: 220,
      render: (_: any, r: IOrder) => <span>{r.shop?.shop_name || ''}</span>,
    },
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
        <Tooltip title="Xem chi tiết">
          <Button
            size="small"
            type="text"
            icon={<InfoCircleOutlined />}
            onClick={() => { fetchOrderById(r.id); setOpen(true); }}
          />
        </Tooltip>
      ),
      width: 100,
    },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Quản lý đơn hàng</h3>

        <div className="mb-4">
          <Space wrap size="middle">
            <Select
              allowClear
              placeholder="Trạng thái"
              style={{ width: 200 }}
              value={status}
              onChange={(val) => { setStatus(val as OrderStatus | undefined); setPage(1); }}
              options={['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'].map((s) => ({ value: s, label: s }))}
            />
            <Input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} style={{ width: 240 }} allowClear />
            <Input placeholder="Vendor ID" value={vendorId} onChange={(e) => setVendorId(e.target.value)} style={{ width: 240 }} allowClear />
            <Select
              value={sortBy}
              style={{ width: 200 }}
              onChange={(v) => { setSortBy(v as any); setPage(1); }}
              options={[
                { value: 'createdAt', label: 'Sắp xếp: Ngày tạo' },
                { value: 'totalAmount', label: 'Sắp xếp: Tổng tiền' },
                { value: 'status', label: 'Sắp xếp: Trạng thái' },
              ]}
            />
            <Select
              value={sortType}
              style={{ width: 160 }}
              onChange={(v) => { setSortType(v as any); setPage(1); }}
              options={[{ value: 'desc', label: 'Giảm dần' }, { value: 'asc', label: 'Tăng dần' }]}
            />
            <Select
              value={pageSize}
              style={{ width: 140 }}
              onChange={(v) => { setPageSize(Number(v)); setPage(1); }}
              options={[10, 20, 50, 100].map(n => ({ value: n, label: `${n}/trang` }))}
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
          scroll={{ x: 1100 }}
          pagination={{
            current: page,
            pageSize,
            total: adminMeta.totalElements,
            showSizeChanger: true,
            showTotal: (t) => `Tổng ${t} đơn hàng`,
          }}
          onChange={(p) => {
            setPage(p.current || 1);
            setPageSize(p.pageSize || 10);
          }}
        />
      </div>

      <Drawer
        title={
          <div className="flex justify-between items-center pr-8">
            <Space direction="vertical" size={0}>
              <Text type="secondary" style={{ fontSize: 12 }}>CHI TIẾT ĐƠN HÀNG</Text>
              <Text strong style={{ fontSize: 16 }}>#{selectedOrder?.id}</Text>
            </Space>
            {selectedOrder && (
              <Tag color={statusColor[selectedOrder.status]} className="mr-0 text-sm py-1 px-3">
                {selectedOrder.status}
              </Tag>
            )}
          </div>
        }
        placement="right"
        width={640}
        onClose={() => setOpen(false)}
        open={open}
        styles={{ body: { paddingBottom: 80 } }}
      >
        {selectedOrder ? (
          <div className="space-y-6">
            {/* Thông tin Shop & User */}
            <Card size="small" bordered={false} className="bg-gray-50">
              <Descriptions column={1} size="small" layout="horizontal">
                <Descriptions.Item label={<Space><ShopOutlined /> Cửa hàng</Space>}>
                  <Text strong>{selectedOrder.shop?.shop_name}</Text>
                  <Text type="secondary" className="ml-2">({selectedOrder.shop?.id})</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Space><UserOutlined /> Khách hàng</Space>}>
                  <Text strong>{selectedOrder.user?.fullName || 'N/A'}</Text>
                  <Text type="secondary" className="ml-2">({selectedOrder.user?.id})</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Space><ClockCircleOutlined /> Ngày tạo</Space>}>
                  {formatDateVN(selectedOrder.created_at)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Danh sách sản phẩm */}
            <div>
              <Divider orientation="left" style={{ margin: '0 0 16px 0' }}>Sản phẩm</Divider>
              <List
                itemLayout="horizontal"
                dataSource={selectedOrder.items || []}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar shape="square" size={48} icon={<ShoppingOutlined />} style={{ backgroundColor: '#f0f0f0', color: '#8c8c8c' }} />
                      }
                      title={<Text strong>{item.product_name}</Text>}
                      description={<Text type="secondary">ID: {item.product_id}</Text>}
                    />
                    <div className="text-right">
                      <div className="text-gray-500 text-xs">x{item.quantity}</div>
                      <div className="font-medium">{currency(item.subtotal)}</div>
                    </div>
                  </List.Item>
                )}
              />
            </div>

            {/* Thông tin tài chính */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <Row gutter={[16, 8]}>
                <Col span={12} className="text-gray-600">Tạm tính:</Col>
                <Col span={12} className="text-right font-medium">{currency(selectedOrder.subtotal)}</Col>

                <Col span={12} className="text-gray-600">Giảm giá:</Col>
                <Col span={12} className="text-right text-red-500">-{currency(selectedOrder.discount_amount)}</Col>

                <Col span={12} className="text-gray-600">Phí vận chuyển:</Col>
                <Col span={12} className="text-right">{currency(selectedOrder.shipping_fee)}</Col>

                <Col span={24}><Divider style={{ margin: '8px 0' }} /></Col>

                <Col span={12} className="text-lg font-bold text-gray-800">Tổng cộng:</Col>
                <Col span={12} className="text-right text-lg font-bold text-blue-600">
                  {currency(selectedOrder.total_amount)}
                </Col>
              </Row>
            </div>

            {/* Lịch sử trạng thái (Timeline) */}
            <div>
              <Divider orientation="left">Lịch sử đơn hàng</Divider>
              <div className="pl-2">
                <Timeline
                  mode="left"
                  items={(selectedOrder.status_history || []).map((h) => ({
                    color: statusColor[h.status],
                    label: <span className="text-gray-500 text-xs">{formatDateVN(h.updated_at)}</span>,
                    children: (
                      <>
                        <Tag color={statusColor[h.status]}>{h.status}</Tag>
                        {h.note && <div className="text-gray-500 text-sm mt-1">{h.note}</div>}
                      </>
                    ),
                  }))}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-400">Không có dữ liệu</div>
        )}
      </Drawer>
    </div>
  );
};

export default AdminOrdersPage;