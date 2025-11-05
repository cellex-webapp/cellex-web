import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Empty, Alert, Button, Pagination } from 'antd';
import ProductCard from '@/features/clients/components/Product/ProductCard';
import ShopCard from '@/features/clients/components/Shop/ShopCard';
import { useProduct } from '@/hooks/useProduct';

const ProductByShop: React.FC = () => {
  const params = useParams<Record<string, string | undefined>>();
  const shopIdParam = params.shopId ?? params.id ?? undefined;

  const { products, isLoading: prodLoading, fetchProductsByShop } = useProduct();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [numberOfElements, setNumberOfElements] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!shopIdParam) return;
    setError(null);
    fetchProductsByShop(String(shopIdParam), { page, size: pageSize })
      .unwrap()
      .then((res: IPage<IProduct>) => {
        setTotal(res.totalElements || 0);
        setNumberOfElements(res.numberOfElements || res.content?.length || 0);
      })
      .catch((err: any) => {
        console.error('Failed to fetch products by shop:', err);
        setError('Không thể tải sản phẩm của cửa hàng. Vui lòng thử lại.');
      });
  }, [shopIdParam, fetchProductsByShop, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const data = useMemo<IProduct[]>(() => (products || []) as IProduct[], [products]);

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
            action={<Button size="small" danger onClick={load}>Tải lại</Button>}
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

              {total > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">Hiển thị {numberOfElements} / {total} sản phẩm</div>
                  <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    showSizeChanger
                    pageSizeOptions={[50, 100, 150, 200].map(String)}
                    onChange={(p, size) => {
                      if (size && size !== pageSize) {
                        setPageSize(size);
                        setPage(1);
                      } else setPage(p);
                    }}
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
