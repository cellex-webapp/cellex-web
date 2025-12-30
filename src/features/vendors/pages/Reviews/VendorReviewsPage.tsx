/**
 * Vendor Reviews Page
 * 
 * Main page for vendors to manage reviews for their shop.
 * Features:
 * - View all reviews for the shop
 * - Filter by rating, response status, and search
 * - Add/edit/delete vendor responses
 * - Overview statistics
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Typography,
  Spin,
  Empty,
  Pagination,
  Alert,
  Tabs,
  Badge,
  Button,
  Drawer,
  Rate,
  Avatar,
  Image,
  Tag,
  message,
} from 'antd';
import {
  MessageOutlined,
  StarFilled,
  ReloadOutlined,
  UserOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { useVendorReview } from '@/hooks/useVendorReview';
import { shopService } from '@/services/shop.service';
import {
  VendorReviewCard,
  VendorReviewStats,
  VendorReviewFilters,
} from './components';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * Format date to Vietnamese locale
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const VendorReviewsPage: React.FC = () => {
  const {
    reviews,
    pagination,
    filters,
    stats,
    isLoading,
    isSubmittingResponse,
    isDeletingResponse,
    fetchShopReviews,
    addVendorResponse,
    deleteVendorResponse,
    getFilteredReviews,
    updateFilters,
    clearFilters,
    setPagination,
  } = useVendorReview();

  const [shopId, setShopId] = useState<string | null>(null);
  const [shopInfo, setShopInfo] = useState<IShop | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<IReview | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch shop info
  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const response = await shopService.getMyShop();
        if (response.result) {
          setShopId(response.result.id);
          setShopInfo(response.result);
        }
      } catch (error) {
        message.error('Không thể tải thông tin shop');
      }
    };
    fetchShopInfo();
  }, []);

  // Fetch reviews when shopId or pagination changes
  useEffect(() => {
    if (shopId) {
      fetchShopReviews(shopId, {
        page: pagination.page,
        limit: pagination.limit,
      });
    }
  }, [shopId, pagination.page, pagination.limit, fetchShopReviews]);

  // Get filtered reviews based on current filters
  const filteredReviews = getFilteredReviews();

  // Filter by tab
  const getTabFilteredReviews = useCallback(() => {
    switch (activeTab) {
      case 'pending':
        return filteredReviews.filter((r) => !r.vendor_response);
      case 'responded':
        return filteredReviews.filter((r) => !!r.vendor_response);
      default:
        return filteredReviews;
    }
  }, [activeTab, filteredReviews]);

  const displayReviews = getTabFilteredReviews();

  // Handle pagination
  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
      limit: pageSize || prev.limit,
    }));
  };

  // Handle refresh
  const handleRefresh = () => {
    if (shopId) {
      fetchShopReviews(shopId, {
        page: pagination.page,
        limit: pagination.limit,
      });
    }
  };

  // Handle respond
  const handleRespond = async (reviewId: string, comment: string) => {
    await addVendorResponse(reviewId, comment);
  };

  // Handle delete response
  const handleDeleteResponse = async (reviewId: string) => {
    await deleteVendorResponse(reviewId);
  };

  // Calculate tab counts
  const pendingCount = reviews.filter((r) => !r.vendor_response).length;
  const respondedCount = reviews.filter((r) => !!r.vendor_response).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Title level={3} className="!mb-1 flex items-center gap-2">
            <MessageOutlined className="text-indigo-600" />
            Quản lý Đánh giá
          </Title>
          <Text type="secondary">
            Xem và phản hồi đánh giá từ khách hàng
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={isLoading}
        >
          Làm mới
        </Button>
      </div>

      {/* Shop Info Alert */}
      {shopInfo && shopInfo.status !== 'APPROVED' && (
        <Alert
          message="Shop chưa được xác minh"
          description="Đánh giá chỉ hiển thị khi shop đã được xác minh. Vui lòng hoàn tất xác minh shop."
          type="warning"
          showIcon
          className="mb-6"
        />
      )}

      {/* Statistics */}
      <VendorReviewStats stats={stats} />

      {/* Filters */}
      <VendorReviewFilters
        filters={filters}
        onFilterChange={updateFilters}
        onClearFilters={clearFilters}
        isLoading={isLoading}
      />

      {/* Tabs and Content */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="px-4! pt-4"
          tabBarExtraContent={
            <Text type="secondary" className="text-sm pr-4">
              Hiển thị {displayReviews.length} / {filteredReviews.length} đánh giá
            </Text>
          }
        >
          <TabPane
            tab={
              <span className="flex items-center gap-1">
                <StarFilled className="text-yellow-400" />
                Tất cả
                <Badge count={reviews.length} showZero className="ml-1" />
              </span>
            }
            key="all"
          />
          <TabPane
            tab={
              <span className="flex items-center gap-1">
                <ClockCircleOutlined className="text-orange-500" />
                Chờ phản hồi
                <Badge
                  count={pendingCount}
                  showZero
                  className="ml-1"
                  style={{ backgroundColor: pendingCount > 0 ? '#f97316' : '#d1d5db' }}
                />
              </span>
            }
            key="pending"
          />
          <TabPane
            tab={
              <span className="flex items-center gap-1">
                <CheckCircleFilled className="text-green-500" />
                Đã phản hồi
                <Badge
                  count={respondedCount}
                  showZero
                  className="ml-1"
                  style={{ backgroundColor: '#22c55e' }}
                />
              </span>
            }
            key="responded"
          />
        </Tabs>

        {/* Reviews List */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spin size="large" />
            </div>
          ) : displayReviews.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-gray-500">
                  {activeTab === 'pending'
                    ? 'Tất cả đánh giá đã được phản hồi'
                    : activeTab === 'responded'
                    ? 'Chưa có đánh giá nào được phản hồi'
                    : 'Chưa có đánh giá nào'}
                </span>
              }
            />
          ) : (
            <div className="space-y-4">
              {displayReviews.map((review) => (
                <VendorReviewCard
                  key={review.id}
                  review={review}
                  onRespond={handleRespond}
                  onDeleteResponse={handleDeleteResponse}
                  isSubmitting={isSubmittingResponse}
                  isDeleting={isDeletingResponse}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="p-4 border-t border-gray-100 flex justify-center">
            <Pagination
              current={pagination.page}
              pageSize={pagination.limit}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger
              showTotal={(total) => `Tổng ${total} đánh giá`}
              pageSizeOptions={['10', '20', '50']}
            />
          </div>
        )}
      </div>

      {/* Review Detail Drawer */}
      <Drawer
        title={
          <span className="flex items-center gap-2">
            <MessageOutlined className="text-indigo-600" />
            Chi tiết đánh giá
          </span>
        }
        placement="right"
        width={480}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedReview(null);
        }}
      >
        {selectedReview && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-start gap-3">
              <Avatar
                size={56}
                src={selectedReview.user_avatar}
                icon={<UserOutlined />}
                className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600"
              />
              <div>
                <Text strong className="text-lg">
                  {selectedReview.user_name}
                </Text>
                {selectedReview.is_verified_purchase && (
                  <Tag
                    icon={<CheckCircleFilled />}
                    color="success"
                    className="!ml-2"
                  >
                    Đã mua hàng
                  </Tag>
                )}
                <div className="mt-1">
                  <Rate disabled value={selectedReview.rating} className="text-sm" />
                </div>
                <Text type="secondary" className="text-sm block mt-1">
                  {formatDate(selectedReview.created_at)}
                </Text>
              </div>
            </div>

            {/* Comment */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <Paragraph className="mb-0">
                {selectedReview.comment || (
                  <span className="text-gray-400 italic">
                    Không có nội dung đánh giá
                  </span>
                )}
              </Paragraph>
            </div>

            {/* Images */}
            {selectedReview.images && selectedReview.images.length > 0 && (
              <div>
                <Text strong className="mb-2 block">
                  Hình ảnh ({selectedReview.images.length})
                </Text>
                <Image.PreviewGroup>
                  <div className="flex flex-wrap gap-2">
                    {selectedReview.images.map((img, idx) => (
                      <Image
                        key={idx}
                        src={img}
                        width={80}
                        height={80}
                        className="object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            )}

            {/* Videos */}
            {selectedReview.videos && selectedReview.videos.length > 0 && (
              <div>
                <Text strong className="mb-2 block">
                  Video ({selectedReview.videos.length})
                </Text>
                <div className="space-y-2">
                  {selectedReview.videos.map((video, idx) => (
                    <video
                      key={idx}
                      src={video}
                      controls
                      className="w-full rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Vendor Response */}
            {selectedReview.vendor_response && (
              <div className="bg-orange-50 border-l-4 border-orange-400 rounded-r-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShopOutlined className="text-orange-500" />
                  <Text strong className="text-orange-700">
                    Phản hồi từ Shop
                  </Text>
                </div>
                <Paragraph className="mb-0">
                  {selectedReview.vendor_response.comment}
                </Paragraph>
                <Text type="secondary" className="text-xs mt-2 block">
                  {formatDate(
                    selectedReview.vendor_response.updatedAt ||
                      selectedReview.vendor_response.createdAt
                  )}
                </Text>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default VendorReviewsPage;
