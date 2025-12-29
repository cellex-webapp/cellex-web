/**
 * AllRecommendationsPage
 * Full recommendations list page with pagination (like Shopee)
 */
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Pagination, Spin, Empty, Alert, Button, Breadcrumb, Select } from 'antd';
import { HomeOutlined, ReloadOutlined, HeartOutlined, FilterOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import RecommendationCard from '@/features/clients/components/Recommendation/RecommendationCard';
import { useRecommendation } from '@/hooks/useRecommendation';
import { useCategory } from '@/hooks/useCategory';

const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

const AllRecommendationsPage: React.FC = () => {
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

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Fetch all recommendations initially
  useEffect(() => {
    if (isAuthenticated && !hasLoaded) {
      fetchMyRecommendations({ limit: 200, categoryId: selectedCategory || undefined });
      setHasLoaded(true);
    }
  }, [isAuthenticated, hasLoaded, selectedCategory, fetchMyRecommendations]);

  // Handle category change
  const handleCategoryChange = useCallback(
    (value: string | undefined) => {
      setSelectedCategory(value || null);
      setCurrentPage(1);
      fetchMyRecommendations({ limit: 200, categoryId: value });
    },
    [fetchMyRecommendations, setSelectedCategory]
  );

  // Retry on error
  const handleRetry = useCallback(() => {
    clearError();
    fetchMyRecommendations({ limit: 200, categoryId: selectedCategory || undefined });
  }, [clearError, fetchMyRecommendations, selectedCategory]);

  // Handle page change
  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Paginated recommendations
  const paginatedRecommendations = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return myRecommendations.slice(startIndex, startIndex + pageSize);
  }, [myRecommendations, currentPage, pageSize]);

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="container mx-auto">
          <Empty
            description="Vui lòng đăng nhập để xem gợi ý cá nhân hóa"
          >
            <Link to="/login">
              <Button type="primary">Đăng nhập</Button>
            </Link>
          </Empty>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (error) {
      return (
        <Alert
          message="Đã xảy ra lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={handleRetry} icon={<ReloadOutlined />}>
              Tải lại
            </Button>
          }
        />
      );
    }

    if (paginatedRecommendations.length === 0 && hasLoaded) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div className="space-y-2">
              <p className="text-gray-600">
                Chưa có gợi ý sản phẩm nào cho bạn
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
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5">
        {paginatedRecommendations.map((rec) => (
          <RecommendationCard
            key={rec.product_id}
            recommendation={rec}
            showExplanation={false}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="container mx-auto space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            {
              title: (
                <Link to="/" className="flex items-center gap-1">
                  <HomeOutlined />
                  Trang chủ
                </Link>
              ),
            },
            {
              title: (
                <span className="flex items-center gap-1">
                  <HeartOutlined />
                  Gợi ý cho bạn
                </span>
              ),
            },
          ]}
        />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HeartOutlined className="text-orange-500" />
            Gợi ý dành cho bạn
          </h1>

          <div className="flex items-center gap-3">
            {/* Category Filter */}
            {categories.length > 0 && (
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
              Làm mới
            </Button>

            {myRecommendations.length > 0 && (
              <span className="text-gray-500 text-sm">
                {myRecommendations.length} sản phẩm
              </span>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading && !hasLoaded ? (
          <div className="flex justify-center items-center w-full min-h-[400px]">
            <Spin size="large" tip="Đang tải gợi ý..." />
          </div>
        ) : (
          <div className="relative">
            {isLoading && hasLoaded && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <Spin size="large" tip="Đang cập nhật..." />
              </div>
            )}

            {renderContent()}

            {/* Pagination */}
            {!error && myRecommendations.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t">
                <span className="text-sm text-gray-600">
                  Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, myRecommendations.length)} / {myRecommendations.length} gợi ý
                </span>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={myRecommendations.length}
                  showSizeChanger
                  pageSizeOptions={PAGE_SIZE_OPTIONS.map(String)}
                  onChange={handlePageChange}
                  showQuickJumper
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllRecommendationsPage;
