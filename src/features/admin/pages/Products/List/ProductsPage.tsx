import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Table, message, Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useProduct } from '@/hooks/useProduct';
import { useCategory } from '@/hooks/useCategory';
import { shopService } from '@/services/shop.service';
import ProductDetailModal from '@/features/vendors/pages/Product/ProductDetailModal';
import { getAdminProductColumns } from './ProductsTable';
import { useDebounce } from '@/hooks/useDebounce'; 

const AdminProductsPage: React.FC = () => {
  const { 
    products, 
    isLoading, 
    error, 
    pagination,
    fetchAllProducts, 
    searchProducts, 
    fetchProductsByShop, 
    fetchProductsByCategory 
  } = useProduct();
  
  const { categories, fetchAllCategories } = useCategory();
  
  const [q, setQ] = useState('');
  const debouncedQ = useDebounce(q, 350); 
  const [filterMode, setFilterMode] = useState<'all' | 'shop' | 'category'>('all');
  const [filterShopId, setFilterShopId] = useState<string | undefined>(undefined);
  const [filterCategoryId, setFilterCategoryId] = useState<string | undefined>(undefined);
  
  const [shops, setShops] = useState<IShop[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [pageParams, setPageParams] = useState<IPaginationParams>({ 
    page: 1, 
    limit: 10, 
    sortType: 'desc', 
    sortBy: 'createdAt' 
  });

  useEffect(() => {
    (async () => {
      try {
        const resp = await shopService.getShopList(); 
        setShops(resp.result.content);
      } catch (e) {
        console.error("Failed to load shops:", e);
      }
    })();
    
    fetchAllCategories();
  }, [fetchAllCategories]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const loadProducts = useCallback(() => {
    const params: IPaginationParams = { 
      page: pageParams.page, 
      limit: pageParams.limit,
      sortType: 'desc', 
      sortBy: 'createdAt'
    };

    if (filterMode === 'shop' && filterShopId) {
      fetchProductsByShop(filterShopId, params);
      return;
    }
    
    if (filterMode === 'category' && filterCategoryId) {
      fetchProductsByCategory(filterCategoryId, params);
      return;
    }

    if (debouncedQ) {
      searchProducts(debouncedQ, params);
      return;
    }

    fetchAllProducts(params);
  }, [
    pageParams, debouncedQ, filterMode, filterShopId, filterCategoryId, 
    fetchAllProducts, searchProducts, fetchProductsByShop, fetchProductsByCategory
  ]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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
    setFilterShopId(undefined);
    setFilterCategoryId(undefined);
    setQ('');
    setPageParams({ ...pageParams, page: 1 });
  };

  const handleTableChange = (antdPagination: any) => {
    setPageParams({
      ...pageParams,
      page: antdPagination.current || 1,
      limit: antdPagination.pageSize || 10,
    });
  };
  
  const columns = useMemo(() => getAdminProductColumns(handleOpenDetail), [handleOpenDetail]);
  
  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Quản lý sản phẩm</h3>

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
              onChange={handleFilterChange}
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
                value={filterShopId}
                onChange={(val) => { setFilterShopId(val); setPageParams({ ...pageParams, page: 1 }); }}
                showSearch
                optionFilterProp="label"
                options={shops.map((s) => ({ value: s.id, label: s.shop_name }))}
              />
            )}

            {filterMode === 'category' && (
              <Select
                allowClear
                placeholder="Chọn danh mục"
                style={{ width: 240 }}
                value={filterCategoryId}
                onChange={(val) => { setFilterCategoryId(val); setPageParams({ ...pageParams, page: 1 }); }}
                showSearch
                optionFilterProp="label"
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
            )}
          </Space>
        </div>

        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={products}
          columns={columns}
          scroll={{ x: 1100 }}
          size="middle"
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (t) => `Tổng ${t} sản phẩm`,
          }}
          onChange={handleTableChange}
        />
      </div>

      <ProductDetailModal productId={detailId} open={detailOpen} onClose={handleCloseDetail} />
    </div>
  );
};

export default AdminProductsPage;