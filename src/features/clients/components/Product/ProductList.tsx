import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pagination, Spin, Empty, Alert, Button } from 'antd';
import ProductCard from './ProductCard';
import { useProduct } from '@/hooks/useProduct';

interface Props {
  title?: string;
  pageSize?: number;
}

const ProductList: React.FC<Props> = ({ title = 'Sản phẩm nổi bật', pageSize = 50 }) => {
  const { products, isLoading, fetchAllProducts } = useProduct();
  const [page, setPage] = useState(1);
  const [pageSizeState, setPageSizeState] = useState<number>(pageSize || 12);
  const [total, setTotal] = useState(0);
  const [numberOfElements, setNumberOfElements] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
        setError(null); 
    fetchAllProducts({ page, limit: pageSizeState, sortType: 'desc', sortBy: 'createdAt' })
      .unwrap()
      .then((res: IPage<IProduct>) => {
        setTotal(res.totalElements);
        setNumberOfElements(res.numberOfElements || res.content?.length || 0);
      })
      .catch((err: any) => {
                console.error("Failed to fetch products:", err);
                setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
            });
  }, [fetchAllProducts, page, pageSizeState]);

  useEffect(() => {
    load();
  }, [load]);

  const data = useMemo<IProduct[]>(() => (products || []) as IProduct[], [products]);

    const renderContent = () => {
        if (error) {
            return (
                <Alert
                    message="Đã xảy ra lỗi"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" danger onClick={load}>
                            Tải lại
                        </Button>
                    }
                />
            );
        }

        if (!isLoading && data.length === 0) {
            return (
                <div className="flex justify-center items-center min-h-[200px]">
                    <Empty description="Không có sản phẩm nào" />
                </div>
            );
        }

        return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5">
          {data.map((p: IProduct) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        );
    };

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}

      <Spin spinning={isLoading} tip="Đang tải...">
        {renderContent()}
      </Spin>

      {!error && total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
            <span>Hiển thị {numberOfElements} / {total} sản phẩm</span>
            <Pagination
              current={page}
              pageSize={pageSizeState}
              total={total}
              showSizeChanger={true}
              pageSizeOptions={[50, 100, 150, 200].map(String)}
              onChange={(p, size) => {
                if (size && size !== pageSizeState) {
                  setPageSizeState(size);
                  setPage(1);
                } else {
                  setPage(p);
                }
              }}
            />
          </div>
            )}
    </div>
  );
};

export default ProductList;