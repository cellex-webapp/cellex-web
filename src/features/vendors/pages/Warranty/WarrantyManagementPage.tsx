import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button, Card, Drawer, Input, Space, Table, Tag, Typography, message,
  Tabs, Avatar, Divider, Select, Popconfirm, Image, Empty, Tooltip,
} from 'antd';
import {
  SafetyCertificateOutlined, SearchOutlined, EyeOutlined,
  ReloadOutlined, UserOutlined, ShoppingCartOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  SyncOutlined, SendOutlined,
} from '@ant-design/icons';
import { warrantyService } from '@/services/warranty.service';
import { formatDateVN } from '@/utils/date';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const warrantyStatusConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  PENDING: { color: 'gold', label: 'Chờ xử lý', icon: <ClockCircleOutlined /> },
  PROCESSING: { color: 'blue', label: 'Đang xử lý', icon: <SyncOutlined spin /> },
  COMPLETED: { color: 'green', label: 'Hoàn thành', icon: <CheckCircleOutlined /> },
  REJECTED: { color: 'red', label: 'Từ chối', icon: <CloseCircleOutlined /> },
};

const statusOptions: WarrantyStatus[] = ['PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED'];

const WarrantyManagementPage: React.FC = () => {
  const [claims, setClaims] = useState<IWarrantyClaimDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<IWarrantyClaimDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Form state for respond
  const [respondStatus, setRespondStatus] = useState<WarrantyStatus>('PROCESSING');
  const [respondMessage, setRespondMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await warrantyService.getShopClaims({
        page,
        limit: pageSize,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        sortBy: 'createdAt',
        sortType: 'desc',
      });
      setClaims(res.result?.content ?? []);
      setTotal(res.result?.totalElements ?? 0);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách bảo hành');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleOpenDrawer = (claim: IWarrantyClaimDetail) => {
    setSelectedClaim(claim);
    setRespondStatus(claim.status === 'PENDING' ? 'PROCESSING' : claim.status);
    setRespondMessage(claim.shopResponse || '');
    setDrawerOpen(true);
  };

  const handleRespond = async () => {
    if (!selectedClaim) return;
    setIsSubmitting(true);
    try {
      await warrantyService.respondToClaim(selectedClaim.id, {
        status: respondStatus,
        shopResponse: respondMessage || undefined,
      });
      message.success('Cập nhật bảo hành thành công!');
      setDrawerOpen(false);
      setSelectedClaim(null);
      load();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể cập nhật bảo hành');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Client-side text search
  const data = useMemo(() => {
    if (!search.trim()) return claims;
    const kw = search.toLowerCase();
    return claims.filter((c) =>
      c.orderCode?.toLowerCase().includes(kw) ||
      c.userName?.toLowerCase().includes(kw) ||
      c.productName?.toLowerCase().includes(kw)
    );
  }, [claims, search]);

  const columns = [
    {
      title: 'Mã ĐH / Khách hàng',
      key: 'info',
      width: 200,
      render: (_: any, r: IWarrantyClaimDetail) => (
        <Space direction="vertical" size={2}>
          <Text strong className="text-gray-700" style={{ fontSize: 13 }}>
            {r.orderCode || 'N/A'}
          </Text>
          <div className="flex items-center gap-1">
            <Avatar size={16} icon={<UserOutlined />} className="bg-gray-300 flex-shrink-0" />
            <Text type="secondary" ellipsis style={{ fontSize: 12, maxWidth: 130 }}>
              {r.userName || r.userId}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 260,
      render: (_: any, r: IWarrantyClaimDetail) => (
        <div className="flex items-center gap-3">
          <Avatar
            shape="square"
            size={44}
            src={r.productImage}
            icon={<ShoppingCartOutlined />}
            className="bg-gray-100 flex-shrink-0 border border-gray-200"
          />
          <Text ellipsis className="max-w-[180px] text-sm" title={r.productName}>
            {r.productName || 'Sản phẩm'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Ngày tạo',
      key: 'createdAt',
      width: 140,
      render: (_: any, r: IWarrantyClaimDetail) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {formatDateVN(r.createdAt)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center' as const,
      render: (s: string) => {
        const conf = warrantyStatusConfig[s];
        if (!conf) return <Tag>{s}</Tag>;
        return (
          <Tag color={conf.color} className="font-medium text-center" icon={conf.icon}>
            {conf.label}
          </Tag>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      fixed: 'right' as const,
      width: 60,
      align: 'center' as const,
      render: (_: any, r: IWarrantyClaimDetail) => (
        <Tooltip title="Xem chi tiết & Xử lý">
          <Button
            type="text"
            shape="circle"
            icon={<EyeOutlined className="text-gray-500 hover:text-blue-600" />}
            onClick={() => handleOpenDrawer(r)}
          />
        </Tooltip>
      ),
    },
  ];

  const tabItems = [
    { key: 'ALL', label: 'Tất cả' },
    ...statusOptions.map((key) => ({
      key,
      label: (
        <span className="flex items-center gap-1">
          {warrantyStatusConfig[key]?.icon}
          {warrantyStatusConfig[key]?.label}
        </span>
      ),
    })),
  ];

  // Count per status for badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    claims.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return counts;
  }, [claims]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen bg-gray-50">
      <Space direction="vertical" size="large" className="w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Title level={3} className="!mb-0 flex items-center gap-2">
              <SafetyCertificateOutlined className="text-indigo-600" />
              Quản lý Bảo hành
            </Title>
            <Text type="secondary">Xử lý yêu cầu bảo hành từ khách hàng</Text>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={load}
            loading={isLoading}
          >
            Làm mới
          </Button>
        </div>

        {/* Main Card */}
        <Card bordered={false} className="shadow-sm rounded-lg overflow-hidden" bodyStyle={{ padding: 0 }}>
          {/* Tabs & Search */}
          <div className="p-4 border-b border-gray-100 bg-white">
            <Tabs
              activeKey={statusFilter}
              onChange={(k) => { setStatusFilter(k); setPage(1); }}
              items={tabItems.map((tab) => ({
                ...tab,
                label: tab.key === 'ALL'
                  ? tab.label
                  : (
                    <span className="flex items-center gap-1">
                      {tab.label}
                      {statusCounts[tab.key] > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] rounded-full bg-gray-100 text-gray-600 ml-1">
                          {statusCounts[tab.key]}
                        </span>
                      )}
                    </span>
                  ),
              }))}
              className="!mb-0"
            />
            <div className="mt-4">
              <Input
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder="Tìm theo mã đơn, khách hàng hoặc sản phẩm..."
                style={{ maxWidth: 360 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
              />
            </div>
          </div>

          {/* Table */}
          <Table
            rowKey="id"
            loading={isLoading}
            dataSource={data}
            columns={columns as any}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              showTotal: (t) => `Tổng ${t} phiếu bảo hành`,
              className: 'p-4',
            }}
            onChange={(p) => {
              setPage(p.current || 1);
              setPageSize(p.pageSize || 10);
            }}
            size="middle"
            scroll={{ x: 800 }}
            locale={{ emptyText: <Empty description="Chưa có yêu cầu bảo hành nào" /> }}
          />
        </Card>
      </Space>

      {/* Detail Drawer */}
      <Drawer
        title={
          <span className="flex items-center gap-2 font-bold text-lg">
            <SafetyCertificateOutlined className="text-indigo-600" />
            Chi tiết phiếu bảo hành
          </span>
        }
        placement="right"
        width={560}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedClaim(null); }}
        extra={selectedClaim && (
          <Tag
            color={warrantyStatusConfig[selectedClaim.status]?.color || 'default'}
            icon={warrantyStatusConfig[selectedClaim.status]?.icon}
          >
            {warrantyStatusConfig[selectedClaim.status]?.label || selectedClaim.status}
          </Tag>
        )}
      >
        {selectedClaim && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="text-gray-500 mb-1">Mã đơn hàng</div>
                  <div className="font-medium">{selectedClaim.orderCode || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="text-gray-500 mb-1">Ngày tạo</div>
                  <div className="font-medium">{formatDateVN(selectedClaim.createdAt)}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="text-gray-500 mb-1">Khách hàng</div>
                  <div className="font-medium">{selectedClaim.userName || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="text-gray-500 mb-1">Email</div>
                  <div className="font-medium truncate" title={selectedClaim.userEmail}>
                    {selectedClaim.userEmail || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Product */}
              <div>
                <h4 className="font-bold mb-3">Sản phẩm</h4>
                <div className="border rounded-lg p-4 flex gap-4">
                  <Avatar
                    shape="square"
                    size={72}
                    src={selectedClaim.productImage}
                    icon={<ShoppingCartOutlined />}
                    className="bg-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <Text strong className="text-gray-800">{selectedClaim.productName || 'Sản phẩm'}</Text>
                  </div>
                </div>
              </div>

              {/* Issue Description */}
              <div>
                <h4 className="font-bold mb-3">Mô tả tình trạng lỗi</h4>
                <div className="bg-gray-50 p-4 rounded-lg border whitespace-pre-wrap text-sm">
                  {selectedClaim.issueDescription}
                </div>
              </div>

              {/* Images */}
              {selectedClaim.images && selectedClaim.images.length > 0 && (
                <div>
                  <h4 className="font-bold mb-3">Hình ảnh / Video minh họa</h4>
                  <Image.PreviewGroup>
                    <div className="flex flex-wrap gap-2">
                      {selectedClaim.images.map((url, idx) => (
                        <Image
                          key={idx}
                          src={url}
                          width={90}
                          height={90}
                          className="object-cover rounded-lg border"
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                        />
                      ))}
                    </div>
                  </Image.PreviewGroup>
                </div>
              )}

              {/* Previous Shop Response */}
              {selectedClaim.shopResponse && (
                <div>
                  <h4 className="font-bold mb-3">Phản hồi trước đó</h4>
                  <div className="bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg p-4">
                    <Paragraph className="!mb-0 whitespace-pre-wrap text-sm">
                      {selectedClaim.shopResponse}
                    </Paragraph>
                  </div>
                </div>
              )}

              <Divider />

              {/* Response Form */}
              {selectedClaim.status === 'COMPLETED' || selectedClaim.status === 'REJECTED' ? (
                <div className="text-center text-gray-400 py-4 bg-gray-50 rounded border border-dashed">
                  Phiếu bảo hành này đã được xử lý xong. Trạng thái:{' '}
                  <Tag color={warrantyStatusConfig[selectedClaim.status]?.color}>
                    {warrantyStatusConfig[selectedClaim.status]?.label}
                  </Tag>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-bold">Cập nhật trạng thái</h4>

                  <div>
                    <Text strong className="block mb-2">Trạng thái</Text>
                    <Select
                      value={respondStatus}
                      onChange={setRespondStatus}
                      className="w-full"
                      options={[
                        { value: 'PROCESSING', label: 'Đang xử lý' },
                        { value: 'COMPLETED', label: 'Hoàn thành' },
                        { value: 'REJECTED', label: 'Từ chối' },
                      ]}
                    />
                  </div>

                  <div>
                    <Text strong className="block mb-2">Phản hồi cho khách hàng</Text>
                    <TextArea
                      rows={5}
                      value={respondMessage}
                      onChange={(e) => setRespondMessage(e.target.value)}
                      placeholder="Nhập phản hồi cho khách hàng về tình trạng bảo hành..."
                    />
                  </div>

                  <Popconfirm
                    title="Xác nhận cập nhật"
                    description={`Bạn có chắc chắn muốn cập nhật phiếu bảo hành này thành "${warrantyStatusConfig[respondStatus]?.label}"?`}
                    onConfirm={handleRespond}
                    okText="Đồng ý"
                    cancelText="Hủy"
                  >
                    <Button
                      type="primary"
                      size="large"
                      block
                      loading={isSubmitting}
                      icon={<SendOutlined />}
                      className="!bg-indigo-600 h-12 text-base font-medium shadow-md hover:!bg-indigo-500"
                    >
                      Gửi phản hồi
                    </Button>
                  </Popconfirm>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default WarrantyManagementPage;
