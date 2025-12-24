/**
 * Review Table Component
 * 
 * Table component for displaying review list with pagination,
 * sorting, and action buttons.
 */

import React from 'react';
import { 
  Table, 
  Avatar, 
  Rate, 
  Tooltip, 
  Button, 
  Space, 
  Typography,
  Dropdown,
  Image,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeInvisibleOutlined,
  ReloadOutlined,
  MoreOutlined,
  UserOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { formatDateVN } from '@/utils/date';
import { ReviewStatusBadge } from './ReviewStatusBadge';
import { ModerationBadge } from './ModerationResultPanel';

const { Text, Paragraph } = Typography;

interface ReviewTableProps {
  reviews: IAdminReview[];
  loading?: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number, pageSize: number) => void;
  onViewDetail: (review: IAdminReview) => void;
  onApprove: (reviewId: string) => void;
  onReject: (reviewId: string) => void;
  onHide: (reviewId: string) => void;
  onRemoderate: (reviewId: string) => void;
}

/**
 * ReviewTable Component
 */
export const ReviewTable: React.FC<ReviewTableProps> = ({
  reviews,
  loading = false,
  pagination,
  onPageChange,
  onViewDetail,
  onApprove,
  onReject,
  onHide,
  onRemoderate,
}) => {
  /**
   * Get dropdown menu items based on review status
   */
  const getActionMenuItems = (review: IAdminReview) => {
    const items = [];
    const { status, id } = review;

    // View detail - always available
    items.push({
      key: 'view',
      label: 'Xem chi tiết',
      icon: <EyeOutlined />,
      onClick: () => onViewDetail(review),
    });

    items.push({ type: 'divider' as const });

    // Approve - for pending, auto-rejected, or hidden reviews
    if (['PENDING_MODERATION', 'REJECTED_AUTO', 'HIDDEN'].includes(status)) {
      items.push({
        key: 'approve',
        label: 'Duyệt',
        icon: <CheckCircleOutlined className="text-green-500" />,
        onClick: () => onApprove(id),
      });
    }

    // Reject - for pending or approved reviews
    if (['PENDING_MODERATION', 'APPROVED', 'APPROVED_BY_ADMIN'].includes(status)) {
      items.push({
        key: 'reject',
        label: 'Từ chối',
        icon: <CloseCircleOutlined className="text-red-500" />,
        danger: true,
        onClick: () => onReject(id),
      });
    }

    // Hide - for approved reviews
    if (['APPROVED', 'APPROVED_BY_ADMIN'].includes(status)) {
      items.push({
        key: 'hide',
        label: 'Ẩn',
        icon: <EyeInvisibleOutlined />,
        onClick: () => onHide(id),
      });
    }

    // Remoderate - for pending or auto-rejected reviews
    if (['PENDING_MODERATION', 'REJECTED_AUTO'].includes(status)) {
      items.push({
        key: 'remoderate',
        label: 'Kiểm duyệt lại',
        icon: <ReloadOutlined />,
        onClick: () => onRemoderate(id),
      });
    }

    return items;
  };

  const columns: ColumnsType<IAdminReview> = [
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {record.product_image ? (
            <Image
              src={record.product_image}
              alt={record.product_name || 'Product'}
              width={48}
              height={48}
              className="rounded-lg object-cover"
              preview={false}
              fallback="https://placehold.co/48x48?text=N/A"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <ShoppingOutlined className="text-gray-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <Tooltip title={record.product_name}>
              <Text className="font-medium line-clamp-2">
                {record.product_name || 'N/A'}
              </Text>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: 'Người đánh giá',
      key: 'user',
      width: 180,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Avatar 
            size={32} 
            src={record.user_avatar} 
            icon={<UserOutlined />}
          />
          <div className="min-w-0">
            <Text className="line-clamp-1">{record.user_name || 'Ẩn danh'}</Text>
            {record.is_verified_purchase && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircleOutlined /> Đã mua
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      width: 180,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Rate disabled value={record.rating} className="text-sm" style={{ fontSize: '14px' }} />
          <Text type="secondary" className="text-sm whitespace-nowrap">
            ({record.rating}/5)
          </Text>
        </div>
      ),
    },
    {
      title: 'Nội dung',
      key: 'comment',
      width: 240,
      render: (_, record) => (
        <Tooltip title={record.comment}>
          <Paragraph
            className="!mb-0 text-sm"
            ellipsis={{ rows: 2 }}
          >
            {record.comment || <Text type="secondary" italic>Không có bình luận</Text>}
          </Paragraph>
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 160,
      render: (_, record) => (
        <ReviewStatusBadge status={record.status} size="small" />
      ),
    },
    {
      title: 'Kiểm duyệt',
      key: 'moderation',
      width: 120,
      render: (_, record) => (
        <ModerationBadge 
          moderationResult={record.moderation_result} 
          size="small"
        />
      ),
    },
    {
      title: 'Ngày tạo',
      key: 'created_at',
      width: 140,
      render: (_, record) => (
        <Text type="secondary" className="text-xs">
          {formatDateVN(record.created_at)}
        </Text>
      ),
      sorter: true,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onViewDetail(record)}
            />
          </Tooltip>
          <Dropdown
            menu={{ items: getActionMenuItems(record) }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const paginationConfig: TablePaginationConfig = {
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: pagination.total,
    showSizeChanger: true,
    showTotal: (total, range) => (
      <span className="text-gray-600">
        Hiển thị {range[0]}-{range[1]} trong {total} đánh giá
      </span>
    ),
    pageSizeOptions: ['10', '20', '50', '100'],
    onChange: onPageChange,
    onShowSizeChange: onPageChange,
  };

  return (
    <Table<IAdminReview>
      rowKey="id"
      columns={columns}
      dataSource={reviews}
      loading={loading}
      pagination={paginationConfig}
      scroll={{ x: 1400 }}
      size="middle"
      className="admin-review-table"
      rowClassName={(record) => {
        if (record.status === 'PENDING_MODERATION') return 'bg-yellow-50/30';
        if (record.status === 'REJECTED_AUTO' || record.status === 'REJECTED_BY_ADMIN') return 'bg-red-50/30';
        return '';
      }}
    />
  );
};

export default ReviewTable;
