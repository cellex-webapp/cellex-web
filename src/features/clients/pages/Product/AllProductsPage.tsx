/**
 * AllProductsPage
 * Full products list page with pagination (like Shopee)
 */
import React, { useCallback, useEffect } from 'react';
import { Pagination, Spin, Empty, Alert, Button, Breadcrumb } from 'antd';
import { HomeOutlined, ReloadOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import ProductCard from '@/features/clients/components/Product/ProductCard';
import { useProduct } from '@/hooks/useProduct';

const AllProductsPage: React.FC = () => {
  const { products, isLoading, error, pagination, fetchAllProducts } = useProduct();

  const loadProducts = useCallback((page: number, limit: number) => {
    fetchAllProducts({ page, limit, sortType: 'desc', sortBy: 'createdAt' });
  }, [fetchAllProducts]);

  useEffect(() => {
    loadProducts(1, 24);
  }, [loadProducts]);

  const handlePageChange = (page: number, pageSize: number) => {
    loadProducts(page, pageSize);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    if (error) {
      return (
        <Alert
          message="Đã xảy ra lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Button
              size="small"
              danger
              onClick={() => loadProducts(pagination.page, pagination.limit)}
              icon={<ReloadOutlined />}
            >
              Tải lại
            </Button>
          }
        />
      );
    }

    if (products.length === 0) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <Empty description="Không có sản phẩm nào" />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
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
                  <ShoppingOutlined />
                  Tất cả sản phẩm
                </span>
              ),
            },
          ]}
        />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingOutlined className="text-orange-500" />
            Tất cả sản phẩm
          </h1>
          {pagination.total > 0 && (
            <span className="text-gray-500">
              {pagination.total} sản phẩm
            </span>
          )}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center w-full min-h-[400px]">
            <Spin size="large" tip="Đang tải dữ liệu..." />
          </div>
        ) : (
          <>
            {renderContent()}

            {/* Pagination */}
            {!error && pagination.total > 0 && products.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t">
                <span className="text-sm text-gray-600">
                  Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total} sản phẩm
                </span>
                <Pagination
                  current={pagination.page}
                  pageSize={pagination.limit}
                  total={pagination.total}
                  showSizeChanger
                  pageSizeOptions={['12', '24', '48', '96']}
                  onChange={handlePageChange}
                  showQuickJumper
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllProductsPage;
