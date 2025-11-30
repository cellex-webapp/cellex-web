import React, { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Empty, Alert, Button, Pagination } from 'antd';
import ProductCard from '@/features/clients/components/Product/ProductCard';
import ShopCard from '@/features/clients/components/Shop/ShopCard';
import { useProduct } from '@/hooks/useProduct';

const ProductByShop: React.FC = () => {
  const params = useParams<Record<string, string | undefined>>();
  const shopIdParam = params.shopId ?? params.id ?? undefined;

  const { 
    products, 
    isLoading: prodLoading, 
    fetchProductsByShop,
    pagination, 
    error, 
  } = useProduct();
  
  const loadProducts = useCallback((page: number, limit: number) => {
    if (!shopIdParam) return;
    
    fetchProductsByShop(String(shopIdParam), { page, limit });
  }, [shopIdParam, fetchProductsByShop]);

  useEffect(() => {
    loadProducts(pagination.page, pagination.limit);
  }, [loadProducts, pagination.page, pagination.limit]);

  const data = useMemo<IProduct[]>(() => (products || []) as IProduct[], [products]);

  const handlePageChange = (p: number, size: number) => {
    loadProducts(p, size);
  };

  if (!shopIdParam) {
    return <div className="py-8 text-center text-gray-600">Không có cửa hàng được chọn</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      <div>
        <ShopCard shopId={shopIdParam} showViewLink={false} />
      </div>

      <div className="bg-white rounded-lg p-4">
        {error && (
          <Alert
            type="error"
            message="Đã xảy ra lỗi"
            description={error} 
            action={<Button size="small" danger onClick={() => loadProducts(pagination.page, pagination.limit)}>Tải lại</Button>}
            className="mb-4"
          />
        )}

        <Spin spinning={prodLoading} tip="Đang tải...">
          {!prodLoading && data.length === 0 && !error ? (
            <div className="min-h-[200px] flex items-center justify-center">
              <Empty description="Không có sản phẩm" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5">
                {data.map((p: IProduct) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {pagination.total > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Hiển thị {data.length} / {pagination.total} sản phẩm
                  </div>
                  <Pagination
                    current={pagination.page}
                    pageSize={pagination.limit}
                    total={pagination.total}
                    showSizeChanger
                    pageSizeOptions={['50', '100', '150', '200']}
                    onChange={handlePageChange} 
                  />
                </div>
              )}
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default ProductByShop;