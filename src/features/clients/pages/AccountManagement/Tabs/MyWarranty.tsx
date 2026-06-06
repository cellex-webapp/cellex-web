import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button, Card, Descriptions, Drawer, Empty, Image, Space, Table,
  Tag, Typography, message, Tooltip, Divider, Avatar,
} from 'antd';
import {
  SafetyCertificateOutlined,
  EyeOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { warrantyService } from '@/services/warranty.service';
import { formatDateVN } from '@/utils/date';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const warrantyStatusConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  PENDING: { color: 'gold', label: 'Chờ xử lý', icon: <ClockCircleOutlined /> },
  PROCESSING: { color: 'blue', label: 'Đang xử lý', icon: <SyncOutlined spin /> },
  COMPLETED: { color: 'green', label: 'Hoàn thành', icon: <CheckCircleOutlined /> },
  REJECTED: { color: 'red', label: 'Từ chối', icon: <CloseCircleOutlined /> },
};

const MyWarranty: React.FC = () => {
  const [claims, setClaims] = useState<IWarrantyClaimDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<IWarrantyClaimDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await warrantyService.getMyClaims();
      // handle both IWarrantyClaimDetail[] and legacy IWarrantyClaim[]
      const data = res.result ?? [];
      setClaims(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách bảo hành');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleOpenDrawer = (claim: IWarrantyClaimDetail) => {
    setSelectedClaim(claim);
    setDrawerOpen(true);
  };

  const columns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 280,
      render: (_: any, r: IWarrantyClaimDetail) => (
        <div className="flex items-center gap-3">
          <Avatar
            shape="square"
            size={48}
            src={r.productImage}
            icon={<ShoppingCartOutlined />}
            className="bg-gray-100 flex-shrink-0 border border-gray-200"
          />
          <div>
            <Text ellipsis className="text-sm font-medium block max-w-[180px]" title={r.productName}>
              {r.productName || 'Sản phẩm'}
            </Text>
            {r.orderCode && (
              <Text type="secondary" className="text-xs">
                ĐH: {r.orderCode}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Mô tả lỗi',
      key: 'issue',
      width: 220,
      render: (_: any, r: IWarrantyClaimDetail) => (
        <Text
          ellipsis={{ tooltip: r.issueDescription }}
          className="text-sm"
          style={{ maxWidth: 200 }}
        >
          {r.issueDescription}
        </Text>
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
          <Tag color={conf.color} className="font-medium" icon={conf.icon}>
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
        <Tooltip title="Xem chi tiết">
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <Space direction="vertical" size="large" className="w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Title level={3} className="!mb-0 flex items-center gap-2">
              <SafetyCertificateOutlined className="text-indigo-600" />
              Quản lý bảo hành của tôi
            </Title>
            <Text type="secondary">Theo dõi trạng thái các yêu cầu bảo hành của bạn</Text>
          </div>
          <Button icon={<ReloadOutlined />} onClick={load} loading={isLoading}>
            Làm mới
          </Button>
        </div>

        {/* Main Card */}
        <Card bordered={false} className="shadow-sm rounded-lg overflow-hidden" bodyStyle={{ padding: 0 }}>
          <Table
            rowKey="id"
            loading={isLoading}
            dataSource={claims}
            columns={columns as any}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showTotal: (t) => `Tổng ${t} phiếu bảo hành`,
              className: 'p-4',
            }}
            size="middle"
            scroll={{ x: 840 }}
            locale={{ emptyText: <Empty description="Bạn chưa có yêu cầu bảo hành nào" /> }}
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
        width={520}
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
                  <div className="text-gray-500 mb-1">Trạng thái</div>
                  <div>
                    <Tag
                      color={warrantyStatusConfig[selectedClaim.status]?.color}
                      icon={warrantyStatusConfig[selectedClaim.status]?.icon}
                    >
                      {warrantyStatusConfig[selectedClaim.status]?.label}
                    </Tag>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="text-gray-500 mb-1">Cập nhật cuối</div>
                  <div className="font-medium">{formatDateVN(selectedClaim.updatedAt)}</div>
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
                    {selectedClaim.orderCode && (
                      <div className="mt-1">
                        <Text type="secondary" className="text-sm">
                          Mã đơn hàng: {selectedClaim.orderCode}
                        </Text>
                      </div>
                    )}
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
                      {selectedClaim.images.map((url: string, idx: number) => (
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

              {/* Shop Response */}
              {selectedClaim.shopResponse && (
                <div>
                  <h4 className="font-bold mb-3">Phản hồi từ cửa hàng</h4>
                  <div className="bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg p-4">
                    <Paragraph className="!mb-0 whitespace-pre-wrap text-sm">
                      {selectedClaim.shopResponse}
                    </Paragraph>
                  </div>
                </div>
              )}

              {!selectedClaim.shopResponse && selectedClaim.status === 'PENDING' && (
                <div className="text-center text-gray-400 py-4 bg-orange-50 rounded border border-dashed border-orange-200">
                  <ClockCircleOutlined className="text-xl mb-2" />
                  <div>Đang chờ cửa hàng phản hồi</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default MyWarranty;
