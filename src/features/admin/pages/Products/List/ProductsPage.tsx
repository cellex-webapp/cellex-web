import React, { useEffect, useMemo, useState } from 'react';
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

  const { products, isLoading, error, fetchAllProducts, searchProducts, deleteProduct, fetchProductsByShop, fetchProductsByCategory } = useProduct();
  const [shops, setShops] = useState<IShop[]>([]);
  const [shopId, setShopId] = useState<string | undefined>(undefined);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'shop' | 'category'>('all');
  const { categories, fetchAllCategories } = useCategory();
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  useEffect(() => {
    // initial load
    fetchAllProducts({ page: 1, limit: 50, sortType: 'desc', sortBy: 'createdAt' });
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
  }, [fetchAllProducts]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  // debounce search keyword to reduce API calls
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const kw = debouncedQ;
    if (filterMode === 'shop' && shopId) {
      fetchProductsByShop(shopId, { page: 1, size: 50 });
      return;
    }
    if (filterMode === 'category' && categoryId) {
      fetchProductsByCategory(categoryId, { page: 1, size: 50 });
      return;
    }
    // no filter (all)
    if (!kw) {
      fetchAllProducts({ page: 1, limit: 50, sortType: 'desc', sortBy: 'createdAt' });
    } else {
      searchProducts(kw, { page: 1, size: 50 });
    }
  }, [debouncedQ, filterMode, shopId, categoryId, fetchAllProducts, searchProducts, fetchProductsByShop, fetchProductsByCategory]);

  const data = useMemo(() => {
    const base = products || [];
    const kw = debouncedQ.toLowerCase();
    if (!kw) return base;
    // When a filter mode is applied, apply client-side keyword filter
    if ((filterMode === 'shop' && shopId) || (filterMode === 'category' && categoryId)) {
      return base.filter((p: IProduct) => p.name?.toLowerCase().includes(kw));
    }
    // Otherwise, base already comes from server-side search
    return base;
  }, [products, debouncedQ, filterMode, shopId, categoryId]);

  // Note: Statistics removed per request to simplify logic and UI

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id).unwrap();
      message.success('Đã xóa sản phẩm');
      fetchAllProducts({ page: 1, limit: 50, sortType: 'desc', sortBy: 'createdAt' });
    } catch (e: any) {
      message.error(e?.message || 'Không thể xóa sản phẩm');
    }
  };

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
  };

  const columns = useMemo(() => getAdminProductColumns(handleOpenDetail, handleDelete), []);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg p-4">
        {/* Header (simplified) */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Quản lý sản phẩm</h3>
        </div>

        {/* Filters */}
        <div className="mb-4">
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
                onChange={(val: any) => setShopId(val)}
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
                onChange={(val: any) => setCategoryId(val)}
                showSearch
                optionFilterProp="label"
                options={(categories || []).map((c: any) => ({ value: c.id, label: c.name }))}
              />
            )}
          </Space>
        </div>

        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={data}
          columns={columns as any}
          scroll={{ x: 1100 }}
          size="middle"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} sản phẩm`,
          }}
        />
      </div>

      <ProductDetailModal productId={detailId} open={detailOpen} onClose={handleCloseDetail} />
    </div>
  );
};

export default AdminProductsPage;