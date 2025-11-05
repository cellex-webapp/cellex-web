import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Empty, Alert, Button, Pagination } from 'antd';
import ProductCard from '@/features/clients/components/Product/ProductCard';
import { useProduct } from '@/hooks/useProduct';
import { useCategory } from '@/hooks/useCategory';

const ProductByCategory: React.FC = () => {
  const params = useParams<Record<string, string | undefined>>();
  const slugOrId = params.slug ?? params.id ?? params.categoryId ?? undefined;

  const { categories, isLoading: catLoading, fetchAllCategories } = useCategory();
  const { products, isLoading: prodLoading, fetchProductsByCategory } = useProduct();

  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [categoryName, setCategoryName] = useState<string | undefined>(undefined);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [total, setTotal] = useState<number>(0);
  const [numberOfElements, setNumberOfElements] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categories || categories.length === 0) fetchAllCategories();
  }, [categories, fetchAllCategories]);

  useEffect(() => {
    if (!slugOrId) return;
    const found = (categories || []).find((c: any) => c.slug === slugOrId || c.id === slugOrId);
    if (found) {
      setCategoryId(found.id);
      setCategoryName(found.name);
    } else {
      setCategoryId(slugOrId);
      setCategoryName(undefined);
    }
  }, [slugOrId, categories]);

  const load = useCallback(() => {
    if (!categoryId) return;
    setError(null);
    fetchProductsByCategory(categoryId, { page, size: pageSize })
      .unwrap()
      .then((res: IPage<IProduct>) => {
        setTotal(res.totalElements || 0);
        setNumberOfElements(res.numberOfElements || res.content?.length || 0);
      })
      .catch((err: any) => {
        console.error('Failed to fetch products by category:', err);
        setError('Không thể tải sản phẩm theo danh mục. Vui lòng thử lại.');
      });
  }, [categoryId, fetchProductsByCategory, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const data = useMemo<IProduct[]>(() => (products || []) as IProduct[], [products]);

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">{categoryName ? `${categoryName}` : 'Sản phẩm'}</h1>
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

        <Spin spinning={prodLoading || catLoading} tip="Đang tải...">
          {!prodLoading && data.length === 0 && !error ? (
            <div className="min-h-[200px] flex items-center justify-center">
              <Empty description="Không có sản phẩm" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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

export default ProductByCategory;
