/**
 * Admin Review Management Page
 * 
 * Main admin dashboard page for managing and moderating product reviews.
 * Features stats cards, filters, review table, and moderation actions.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { 
  Card, 
  Input, 
  Select, 
  Space, 
  Button, 
  DatePicker, 
  Tabs,
  Row,
  Col,
  Statistic,
  Typography,
  message,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeInvisibleOutlined,
  FilterOutlined,
  ClearOutlined,
  StarOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { useAdminReview } from '@/hooks/useAdminReview';
import { ReviewTable } from './components/ReviewTable';
import { ReviewDetailModal } from './components/ReviewDetailModal';
import { ReviewActionModal } from './components/ReviewActionModal';


const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

/**
 * Status options for filter dropdown
 */
const STATUS_OPTIONS: { value: ReviewStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'PENDING_MODERATION', label: 'Chờ kiểm duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt (tự động)' },
  { value: 'APPROVED_BY_ADMIN', label: 'Đã duyệt (admin)' },
  { value: 'REJECTED_AUTO', label: 'Từ chối (tự động)' },
  { value: 'REJECTED_BY_ADMIN', label: 'Từ chối (admin)' },
  { value: 'HIDDEN', label: 'Đã ẩn' },
];

/**
 * Quick filter tabs
 */
const QUICK_TABS = [
  { key: 'all', label: 'Tất cả', icon: <StarOutlined /> },
  { key: 'pending', label: 'Chờ kiểm duyệt', icon: <ClockCircleOutlined /> },
  { key: 'approved', label: 'Đã duyệt', icon: <CheckCircleOutlined /> },
  { key: 'rejected', label: 'Bị từ chối', icon: <CloseCircleOutlined /> },
];

/**
 * Stats Card Component
 */
const StatsCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  loading?: boolean;
}> = ({ title, value, icon, color, bgColor, loading }) => (
  <Card 
    className={`${bgColor} border-none hover:shadow-md transition-shadow`}
    loading={loading}
  >
    <div className="flex items-center justify-between">
      <div>
        <Text type="secondary" className="text-sm">{title}</Text>
        <div className="mt-1">
          <Statistic 
            value={value} 
            valueStyle={{ 
              color, 
              fontWeight: 600, 
              fontSize: '1.75rem' 
            }} 
          />
        </div>
      </div>
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <span style={{ color, fontSize: '1.25rem' }}>{icon}</span>
      </div>
    </div>
  </Card>
);

/**
 * AdminReviewPage Component
 */
const AdminReviewPage: React.FC = () => {
  // Hooks
  const {
    reviews,
    selectedReview,
    stats,
    pagination,
    isLoading,
    isStatsLoading,
    isActionLoading,
    fetchReviews,
    fetchReviewsByStatus,
    fetchPendingReviews,
    fetchStats,
    fetchReviewById,
    approveReview,
    rejectReview,
    hideReview,
    remoderateReview,
    setSelectedReview,
  } = useAdminReview();

  // Local state
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    status: 'ALL' as ReviewStatus | 'ALL',
    productName: '',
    userName: '',
    dateRange: null as [Dayjs, Dayjs] | null,
    search: '',
  });
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | 'hide' | null;
    reviewId: string | null;
    reviewComment?: string;
  }>({
    open: false,
    action: null,
    reviewId: null,
  });

  /**
   * Load data on mount and when filters change
   */
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /**
   * Load reviews based on active tab and filters
   */
  const loadReviews = useCallback((page = 1, pageSize = pagination.pageSize) => {
    const params: IAdminReviewParams = {
      page,
      size: pageSize,
      productName: filters.productName || undefined,
      userName: filters.userName || undefined,
      startDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: filters.dateRange?.[1]?.format('YYYY-MM-DD'),
    };

    // Apply tab-specific filters
    if (activeTab === 'pending') {
      fetchPendingReviews(params);
    } else if (activeTab === 'approved') {
      // Fetch both APPROVED and APPROVED_BY_ADMIN
      if (filters.status !== 'ALL') {
        fetchReviewsByStatus(filters.status as ReviewStatus, params);
      } else {
        fetchReviewsByStatus('APPROVED', params);
      }
    } else if (activeTab === 'rejected') {
      fetchReviewsByStatus('REJECTED_BY_ADMIN', params);
    } else {
      // All reviews
      if (filters.status !== 'ALL') {
        fetchReviewsByStatus(filters.status as ReviewStatus, params);
      } else {
        fetchReviews(params);
      }
    }
  }, [
    activeTab, 
    filters, 
    pagination.pageSize, 
    fetchReviews, 
    fetchReviewsByStatus, 
    fetchPendingReviews
  ]);

  // Load reviews when tab or filters change
  useEffect(() => {
    loadReviews(1);
  }, [activeTab, filters.status, loadReviews]);

  /**
   * Handle tab change
   */
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // Reset status filter when changing tabs
    setFilters(prev => ({ ...prev, status: 'ALL' }));
  };

  /**
   * Handle page change
   */
  const handlePageChange = (page: number, pageSize: number) => {
    loadReviews(page, pageSize);
  };

  /**
   * Handle search/filter
   */
  const handleSearch = () => {
    loadReviews(1);
  };

  /**
   * Clear filters
   */
  const handleClearFilters = () => {
    setFilters({
      status: 'ALL',
      productName: '',
      userName: '',
      dateRange: null,
      search: '',
    });
  };

  /**
   * View review detail
   */
  const handleViewDetail = async (review: IAdminReview) => {
    setSelectedReview(review);
    setDetailModalOpen(true);
    // Fetch full details
    await fetchReviewById(review.id);
  };

  /**
   * Open action modal
   */
  const openActionModal = (
    action: 'approve' | 'reject' | 'hide', 
    reviewId: string,
    reviewComment?: string
  ) => {
    setActionModal({
      open: true,
      action,
      reviewId,
      reviewComment,
    });
  };

  /**
   * Handle action confirm
   */
  const handleActionConfirm = async (
    reviewId: string, 
    action: 'approve' | 'reject' | 'hide', 
    reason?: string
  ): Promise<boolean> => {
    let success = false;

    switch (action) {
      case 'approve':
        success = await approveReview(reviewId, reason);
        break;
      case 'reject':
        if (!reason) {
          message.error('Vui lòng nhập lý do từ chối');
          return false;
        }
        success = await rejectReview(reviewId, reason);
        break;
      case 'hide':
        success = await hideReview(reviewId, reason);
        break;
    }

    if (success) {
      // Refresh stats
      fetchStats();
    }

    return success;
  };

  /**
   * Handle remoderate
   */
  const handleRemoderate = async (reviewId: string) => {
    const success = await remoderateReview(reviewId);
    if (success) {
      loadReviews(pagination.current);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <Title level={3} className="!mb-1">Quản lý Đánh giá</Title>
        <Text type="secondary">
          Kiểm duyệt và quản lý đánh giá sản phẩm từ khách hàng
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={4}>
          <StatsCard
            title="Tổng đánh giá"
            value={stats?.total_reviews || 0}
            icon={<StarOutlined />}
            color="#6366f1"
            bgColor="bg-indigo-50"
            loading={isStatsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <StatsCard
            title="Chờ kiểm duyệt"
            value={stats?.pending_moderation || 0}
            icon={<ClockCircleOutlined />}
            color="#eab308"
            bgColor="bg-yellow-50"
            loading={isStatsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <StatsCard
            title="Đã duyệt"
            value={(stats?.approved || 0) + (stats?.approved_by_admin || 0)}
            icon={<CheckCircleOutlined />}
            color="#22c55e"
            bgColor="bg-green-50"
            loading={isStatsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <StatsCard
            title="Từ chối (tự động)"
            value={stats?.rejected_auto || 0}
            icon={<WarningOutlined />}
            color="#f97316"
            bgColor="bg-orange-50"
            loading={isStatsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <StatsCard
            title="Từ chối (admin)"
            value={stats?.rejected_by_admin || 0}
            icon={<CloseCircleOutlined />}
            color="#ef4444"
            bgColor="bg-red-50"
            loading={isStatsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <StatsCard
            title="Đã ẩn"
            value={stats?.hidden || 0}
            icon={<EyeInvisibleOutlined />}
            color="#6b7280"
            bgColor="bg-gray-100"
            loading={isStatsLoading}
          />
        </Col>
      </Row>

      {/* Main Content Card */}
      <Card className="shadow-sm">
        {/* Quick Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={QUICK_TABS.map(tab => ({
            key: tab.key,
            label: (
              <span className="flex items-center gap-2">
                {tab.icon}
                {tab.label}
                {tab.key === 'pending' && stats?.pending_moderation ? (
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {stats.pending_moderation}
                  </span>
                ) : null}
              </span>
            ),
          }))}
          className="mb-4"
        />

        {/* Filters */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FilterOutlined className="text-gray-400" />
            <Text strong>Bộ lọc</Text>
          </div>
          <Space wrap size="middle">
            <Select
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              options={STATUS_OPTIONS}
              style={{ width: 200 }}
              placeholder="Trạng thái"
            />
            <Input
              placeholder="Tên sản phẩm"
              value={filters.productName}
              onChange={(e) => setFilters(prev => ({ ...prev, productName: e.target.value }))}
              style={{ width: 200 }}
              allowClear
            />
            <Input
              placeholder="Tên người dùng"
              value={filters.userName}
              onChange={(e) => setFilters(prev => ({ ...prev, userName: e.target.value }))}
              style={{ width: 200 }}
              allowClear
            />
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters(prev => ({ 
                ...prev, 
                dateRange: dates as [Dayjs, Dayjs] | null 
              }))}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
            />
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              Tìm kiếm
            </Button>
            <Button 
              icon={<ClearOutlined />}
              onClick={handleClearFilters}
            >
              Xóa bộ lọc
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={() => {
                loadReviews(pagination.current);
                fetchStats();
              }}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        {/* Reviews Table */}
        <ReviewTable
          reviews={reviews}
          loading={isLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
          }}
          onPageChange={handlePageChange}
          onViewDetail={handleViewDetail}
          onApprove={(id) => {
            const review = reviews.find(r => r.id === id);
            openActionModal('approve', id, review?.comment);
          }}
          onReject={(id) => {
            const review = reviews.find(r => r.id === id);
            openActionModal('reject', id, review?.comment);
          }}
          onHide={(id) => {
            const review = reviews.find(r => r.id === id);
            openActionModal('hide', id, review?.comment);
          }}
          onRemoderate={handleRemoderate}
        />
      </Card>

      {/* Review Detail Modal */}
      <ReviewDetailModal
        review={selectedReview}
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedReview(null);
        }}
        onApprove={(id) => openActionModal('approve', id, selectedReview?.comment)}
        onReject={(id) => openActionModal('reject', id, selectedReview?.comment)}
        onHide={(id) => openActionModal('hide', id, selectedReview?.comment)}
        onRemoderate={handleRemoderate}
        isActionLoading={isActionLoading}
      />

      {/* Action Modal */}
      <ReviewActionModal
        open={actionModal.open}
        action={actionModal.action}
        reviewId={actionModal.reviewId}
        reviewComment={actionModal.reviewComment}
        onCancel={() => setActionModal({ open: false, action: null, reviewId: null })}
        onConfirm={handleActionConfirm}
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default AdminReviewPage;
