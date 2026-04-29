/**
 * RecommendationSectionPreview Component
 * Shows a preview of recommendations on HomePage with "View More" button
 * No pagination - just a fixed number of items
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Spin, Empty, Alert, Button, Skeleton, Card } from 'antd';
import {
  ReloadOutlined,
  HeartOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import RecommendationCard from './RecommendationCard';
import { useRecommendation } from '@/hooks/useRecommendation';

interface Props {
  title?: string;
  maxItems?: number;
  viewAllLink?: string;
}

// Skeleton loading card component
const SkeletonCard: React.FC = () => (
  <Card className="h-full rounded-lg overflow-hidden" bodyStyle={{ padding: 12 }}>
    <Skeleton.Image active className="!w-full !h-40 mb-3" />
    <Skeleton active paragraph={{ rows: 2 }} />
  </Card>
);

const RecommendationSectionPreview: React.FC<Props> = ({
  title = 'Dành riêng cho bạn',
  maxItems = 12,
  viewAllLink = '/recommendations',
}) => {
  const {
    myRecommendations,
    isLoading,
    error,
    isAuthenticated,
    fetchMyRecommendations,
    clearError,
  } = useRecommendation();

  const [hasLoaded, setHasLoaded] = useState(false);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated && !hasLoaded) {
      fetchMyRecommendations({ limit: 50 }); // Fetch 50 items (backend default)
      setHasLoaded(true);
    }
  }, [isAuthenticated, hasLoaded, fetchMyRecommendations]);

  // Retry on error
  const handleRetry = useCallback(() => {
    clearError();
    fetchMyRecommendations({ limit: 50 });
  }, [clearError, fetchMyRecommendations]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Loading state with skeleton
  if (isLoading && !hasLoaded) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <HeartOutlined className="text-orange-500" />
            {title}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <HeartOutlined className="text-orange-500" />
          {title}
        </h2>
        <Alert
          message="Không thể tải gợi ý"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={handleRetry} icon={<ReloadOutlined />}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  // Empty state - show helpful message
  if (myRecommendations.length === 0 && hasLoaded) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <HeartOutlined className="text-orange-500" />
          {title}
        </h2>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div className="space-y-2">
              <p className="text-gray-600">
                Chúng tôi đang tìm hiểu sở thích của bạn...
              </p>
              <p className="text-gray-400 text-sm">
                Hãy khám phá và mua sắm để nhận gợi ý cá nhân hóa!
              </p>
            </div>
          }
        >
          <Link to="/">
            <Button type="primary" className="bg-orange-500 hover:bg-orange-600">
              Khám phá sản phẩm
            </Button>
          </Link>
        </Empty>
      </div>
    );
  }

  const displayedRecommendations = myRecommendations.slice(0, maxItems);
  const hasMore = myRecommendations.length > maxItems;

  return (
    <div className="space-y-4">
      {/* Header with View All button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <HeartOutlined className="text-orange-500" />
          {title}
        </h2>
        {hasMore && (
          <Link
            to={viewAllLink}
            className="text-orange-500 hover:text-orange-600 flex items-center gap-1 text-sm font-medium"
          >
            Xem tất cả
            <RightOutlined className="text-xs" />
          </Link>
        )}
      </div>

      {/* Recommendations Grid */}
      <div className="relative">
        {isLoading && hasLoaded && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <Spin size="large" tip="Đang cập nhật..." />
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5">
          {displayedRecommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.product_id}
              recommendation={recommendation}
              showExplanation={false}
            />
          ))}
        </div>
      </div>

      {/* View More Button - centered at bottom */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Link to={viewAllLink}>
            <Button
              type="primary"
              size="large"
              className="bg-orange-500 hover:bg-orange-600 px-8"
            >
              Xem thêm gợi ý
              <RightOutlined />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecommendationSectionPreview;
