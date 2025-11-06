import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Table, message, Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useProduct } from '@/hooks/useProduct';
import ProductDetailModal from '@/features/vendors/pages/Product/ProductDetailModal';
import { shopService } from '@/services/shop.service';
import { useCategory } from '@/hooks/useCategory';
import { getAdminProductColumns } from './ProductsTable';

const AdminProductsPage: React.FC = () => {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [numberOfElements, setNumberOfElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { products, isLoading, error, fetchAllProducts, searchProducts, fetchProductsByShop, fetchProductsByCategory } = useProduct();
  const [shops, setShops] = useState<IShop[]>([]);
  const [shopId, setShopId] = useState<string | undefined>(undefined);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'shop' | 'category'>('all');
  const { categories, fetchAllCategories } = useCategory();
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  useEffect(() => {
    // initial load
    fetchAllProducts({ page: 1, limit: pageSize, sortType: 'desc', sortBy: 'createdAt' })
      .unwrap()
      .then((res: IPage<IProduct>) => {
        setTotal(res.totalElements);
        setNumberOfElements(res.numberOfElements || res.content?.length || 0);
        setTotalPages(res.totalPages);
      })
      .catch(() => {});
    // load shops for filter
    (async () => {
      try {
        const resp = await shopService.getShopList();
        setShops(resp.result || []);
      } catch (e) {
        // ignore
      }
    })();
    // load categories for filter
    fetchAllCategories();
  }, [fetchAllProducts, pageSize, fetchAllCategories]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  // debounce search keyword to reduce API calls
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const loadData = useCallback(() => {
    const kw = debouncedQ;
    // Decide which API to call based on filter mode
    if (filterMode === 'shop' && shopId) {
      fetchProductsByShop(shopId, { page, size: pageSize })
        .unwrap()
        .then((res: IPage<IProduct>) => {
          setTotal(res.totalElements);
          setNumberOfElements(res.numberOfElements || res.content?.length || 0);
          setTotalPages(res.totalPages);
        })
        .catch(() => {});
      return;
    }
    if (filterMode === 'category' && categoryId) {
      fetchProductsByCategory(categoryId, { page, size: pageSize })
        .unwrap()
        .then((res: IPage<IProduct>) => {
          setTotal(res.totalElements);
          setNumberOfElements(res.numberOfElements || res.content?.length || 0);
          setTotalPages(res.totalPages);
        })
        .catch(() => {});
      return;
    }
    // no filter (all)
    if (!kw) {
      fetchAllProducts({ page, limit: pageSize, sortType: 'desc', sortBy: 'createdAt' })
        .unwrap()
        .then((res: IPage<IProduct>) => {
          setTotal(res.totalElements);
          setNumberOfElements(res.numberOfElements || res.content?.length || 0);
          setTotalPages(res.totalPages);
        })
        .catch(() => {});
    } else {
      searchProducts(kw, { page, size: pageSize })
        .unwrap()
        .then((res: IPage<IProduct>) => {
          setTotal(res.totalElements);
          setNumberOfElements(res.numberOfElements || res.content?.length || 0);
          setTotalPages(res.totalPages);
        })
        .catch(() => {});
    }
  }, [debouncedQ, filterMode, shopId, categoryId, page, pageSize, fetchAllProducts, searchProducts, fetchProductsByShop, fetchProductsByCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const data = useMemo(() => products || [], [products]);

  const handleOpenDetail = (id: string) => {
    setDetailId(id);
    setDetailOpen(true);
  };
  const handleCloseDetail = () => {
    setDetailId(null);
    setDetailOpen(false);
  };

  const handleFilterChange = (mode: 'all' | 'shop' | 'category') => {
    setFilterMode(mode);
    setShopId(undefined);
    setCategoryId(undefined);
    setQ('');
    setPage(1);
  };

  const columns = useMemo(() => getAdminProductColumns(handleOpenDetail), []);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg p-4">
        {/* Header (simplified) */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Quản lý sản phẩm</h3>
        </div>

        {/* Filters */}
        <div className="mb-3">
          <Space wrap size="middle">
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              prefix={<SearchOutlined />}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />

            <Select
              value={filterMode}
              onChange={(val: any) => handleFilterChange(val)}
              style={{ width: 160 }}
              options={[
                { value: 'all', label: 'Tất cả sản phẩm' },
                { value: 'shop', label: 'Theo cửa hàng' },
                { value: 'category', label: 'Theo danh mục' },
              ]}
            />

            {filterMode === 'shop' && (
              <Select
                allowClear
                placeholder="Chọn cửa hàng"
                style={{ width: 240 }}
                value={shopId}
                onChange={(val: any) => { setShopId(val); setPage(1); }}
                showSearch
                optionFilterProp="label"
                options={(shops || []).map((s: any) => ({ value: s.id, label: s.shop_name ?? s.name }))}
              />
            )}

            {filterMode === 'category' && (
              <Select
                allowClear
                placeholder="Chọn danh mục"
                style={{ width: 240 }}
                value={categoryId}
                onChange={(val: any) => { setCategoryId(val); setPage(1); }}
                showSearch
                optionFilterProp="label"
                options={(categories || []).map((c: any) => ({ value: c.id, label: c.name }))}
              />
            )}
          </Space>
        </div>

        {/* Meta summary */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <div>
            Tổng: <span className="font-medium">{total}</span> • Trang <span className="font-medium">{(page - 0)}</span>/{totalPages || 1}
          </div>
          <div>
            Hiển thị: <span className="font-medium">{numberOfElements}</span> mục
          </div>
        </div>

        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={data}
          columns={columns as any}
          scroll={{ x: 1100 }}
          size="middle"
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `Tổng ${t} sản phẩm`,
          }}
          onChange={(pagination) => {
            const nextPage = pagination.current || 1;
            const nextSize = pagination.pageSize || pageSize;
            setPage(nextPage);
            setPageSize(nextSize);
          }}
        />
      </div>

      <ProductDetailModal productId={detailId} open={detailOpen} onClose={handleCloseDetail} />
    </div>
  );
};

export default AdminProductsPage;