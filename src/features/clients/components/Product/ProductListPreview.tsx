/**
 * ProductListPreview Component
 * Shows a preview of products on HomePage with "View More" button
 * No pagination - just a fixed number of items
 */
import React, { useCallback, useEffect } from 'react';
import { Spin, Empty, Alert, Button } from 'antd';
import { RightOutlined, ReloadOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { useProduct } from '@/hooks/useProduct';

interface Props {
  title?: string;
  maxItems?: number;
  viewAllLink?: string;
}

const ProductListPreview: React.FC<Props> = ({
  title = 'Sản phẩm mới nhất',
  maxItems = 12,
  viewAllLink = '/products',
}) => {
  const { products, isLoading, error, pagination, fetchAllProducts } = useProduct();

  const loadProducts = useCallback(() => {
    fetchAllProducts({ page: 1, limit: maxItems, sortType: 'desc', sortBy: 'createdAt' });
  }, [fetchAllProducts, maxItems]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const renderData = () => {
    if (error) {
      return (
        <Alert
          message="Đã xảy ra lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={loadProducts} icon={<ReloadOutlined />}>
              Tải lại
            </Button>
          }
        />
      );
    }

    if (products.length === 0) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <Empty description="Không có sản phẩm nào" />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5">
        {products.slice(0, maxItems).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with View All button */}
      <div className="flex items-center justify-between">
        {title && <h2 className="text-xl font-semibold">{title}</h2>}
        {pagination.total > maxItems && (
          <Link
            to={viewAllLink}
            className="text-orange-500 hover:text-orange-600 flex items-center gap-1 text-sm font-medium"
          >
            Xem tất cả
            <RightOutlined className="text-xs" />
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center w-full min-h-[300px]">
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : (
        <>
          {renderData()}

          {/* View More Button - centered at bottom */}
          {!error && pagination.total > maxItems && products.length > 0 && (
            <div className="flex justify-center mt-6">
              <Link to={viewAllLink}>
                <Button
                  type="primary"
                  size="large"
                  className="bg-orange-500 hover:bg-orange-600 px-8"
                >
                  Xem thêm sản phẩm
                  <RightOutlined />
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductListPreview;
