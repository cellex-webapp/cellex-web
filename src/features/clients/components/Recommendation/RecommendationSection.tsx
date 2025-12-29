/**
 * RecommendationSection Component
 * Displays personalized product recommendations on HomePage
 * Features: Grid layout, loading states, category filter, responsive design
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Spin, Empty, Alert, Button, Select, Skeleton, Card } from 'antd';
import {
  ReloadOutlined,
  HeartOutlined,
  FilterOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import RecommendationCard from './RecommendationCard';
import { useRecommendation } from '@/hooks/useRecommendation';
import { useCategory } from '@/hooks/useCategory';

interface Props {
  title?: string;
  maxItems?: number;
  showCategoryFilter?: boolean;
  showViewAll?: boolean;
}

// Skeleton loading card component
const SkeletonCard: React.FC = () => (
  <Card className="h-full rounded-lg overflow-hidden" bodyStyle={{ padding: 12 }}>
    <Skeleton.Image active className="!w-full !h-40 mb-3" />
    <Skeleton active paragraph={{ rows: 2 }} />
  </Card>
);

const RecommendationSection: React.FC<Props> = ({
  title = 'Dành riêng cho bạn',
  maxItems = 12,
  showCategoryFilter = true,
  showViewAll = false,
}) => {
  const {
    myRecommendations,
    isLoading,
    error,
    isAuthenticated,
    selectedCategory,
    fetchMyRecommendations,
    setSelectedCategory,
    clearError,
  } = useRecommendation();

  const { categories } = useCategory();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(maxItems);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated && !hasLoaded) {
      fetchMyRecommendations({ limit: 50, categoryId: selectedCategory || undefined }); // Fetch more for load more feature
      setHasLoaded(true);
    }
  }, [isAuthenticated, hasLoaded, selectedCategory, fetchMyRecommendations]);

  // Refetch when category changes
  const handleCategoryChange = useCallback(
    (value: string | undefined) => {
      setSelectedCategory(value || null);
      setDisplayLimit(maxItems); // Reset display limit when category changes
      fetchMyRecommendations({ limit: 50, categoryId: value });
    },
    [maxItems, fetchMyRecommendations, setSelectedCategory]
  );

  // Retry on error
  const handleRetry = useCallback(() => {
    clearError();
    fetchMyRecommendations({ limit: 50, categoryId: selectedCategory || undefined });
  }, [clearError, fetchMyRecommendations, selectedCategory]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    setDisplayLimit(prev => prev + maxItems);
  }, [maxItems]);

  // Memoized recommendations list
  const displayedRecommendations = useMemo(
    () => myRecommendations.slice(0, displayLimit),
    [myRecommendations, displayLimit]
  );

  const hasMore = myRecommendations.length > displayLimit;

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Loading state with skeleton
  if (isLoading && !hasLoaded) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
  if (displayedRecommendations.length === 0 && hasLoaded) {
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <HeartOutlined className="text-orange-500" />
          {title}
        </h2>

        <div className="flex items-center gap-3">
          {/* Category Filter */}
          {showCategoryFilter && categories.length > 0 && (
            <Select
              allowClear
              placeholder={
                <span className="flex items-center gap-1">
                  <FilterOutlined />
                  Lọc danh mục
                </span>
              }
              className="min-w-[180px]"
              value={selectedCategory || undefined}
              onChange={handleCategoryChange}
              options={categories.map((cat) => ({
                label: cat.name,
                value: cat.id,
              }))}
            />
          )}

          {/* Refresh Button */}
          <Button
            type="text"
            icon={<ReloadOutlined spin={isLoading} />}
            onClick={handleRetry}
            disabled={isLoading}
          >
            <span className="hidden sm:inline">Làm mới</span>
          </Button>

          {/* View All Link */}
          {showViewAll && (
            <Link
              to="/recommendations"
              className="text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              Xem tất cả
              <RightOutlined className="text-xs" />
            </Link>
          )}
        </div>
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

      {/* Stats */}
      {displayedRecommendations.length > 0 && (
        <div className="text-sm text-gray-500 text-center sm:text-left">
          Hiển thị {displayedRecommendations.length} / {myRecommendations.length} gợi ý dựa trên sở thích của bạn
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            type="primary"
            size="large"
            className="bg-orange-500 hover:bg-orange-600 px-8"
            onClick={handleLoadMore}
            loading={isLoading}
          >
            Xem thêm gợi ý
            <RightOutlined />
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecommendationSection;
