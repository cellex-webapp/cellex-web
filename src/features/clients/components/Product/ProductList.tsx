import React, { useCallback, useEffect } from 'react';
import { Pagination, Spin, Empty, Alert, Button } from 'antd';
import ProductCard from './ProductCard';
import { useProduct } from '@/hooks/useProduct';

interface Props {
  title?: string;
  initialPageSize?: number; 
}

const ProductList: React.FC<Props> = ({ title = 'Sản phẩm nổi bật', initialPageSize = 12 }) => {
  const { products, isLoading, error, pagination, fetchAllProducts } = useProduct();
  
  const loadProducts = useCallback((page: number, limit: number) => {
    fetchAllProducts({ page, limit, sortType: 'desc', sortBy: 'createdAt' });
  }, [fetchAllProducts]);

  useEffect(() => {
    loadProducts(1, initialPageSize);
  }, [initialPageSize, loadProducts]);

  const handlePageChange = (p: number, size: number) => {
    loadProducts(p, size);
  };

  const renderData = () => {
    if (error) {
      return (
        <Alert
          message="Đã xảy ra lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={() => loadProducts(pagination.page, pagination.limit)}>
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
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}

      {isLoading ? (
        <div className="flex justify-center items-center w-full min-h-[300px]">
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : (
        <>
          {renderData()}

          {!error && pagination.total > 0 && products.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 mt-4">
              <span>Hiển thị {products.length} / {pagination.total} sản phẩm</span>
              <Pagination
                current={pagination.page}
                pageSize={pagination.limit}
                total={pagination.total}
                showSizeChanger={true}
                pageSizeOptions={['12', '24', '48', '100']}
                onChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;