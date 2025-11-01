import React from 'react';
import { Input, Select, Space } from 'antd';
import { SearchOutlined, ShopOutlined, AppstoreOutlined } from '@ant-design/icons';

interface AdminProductFiltersProps {
  q: string;
  onQChange: (val: string) => void;
  filterMode: 'all' | 'shop' | 'category';
  onFilterModeChange: (mode: 'all' | 'shop' | 'category') => void;
  shopId?: string;
  onShopChange: (id?: string) => void;
  shops: IShop[];
  categoryId?: string;
  onCategoryChange: (id?: string) => void;
  categories: ICategory[];
}

const AdminProductFilters: React.FC<AdminProductFiltersProps> = ({
  q,
  onQChange,
  filterMode,
  onFilterModeChange,
  shopId,
  onShopChange,
  shops,
  categoryId,
  onCategoryChange,
  categories,
}) => {
  return (
    <Space wrap size="middle">
      <Input
        placeholder="Tìm kiếm sản phẩm..."
        prefix={<SearchOutlined />}
        value={q}
        onChange={(e) => onQChange(e.target.value)}
        style={{ width: 300 }}
        allowClear
      />

      <Select
        value={filterMode}
        onChange={onFilterModeChange}
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
          onChange={onShopChange}
          showSearch
          optionFilterProp="label"
          suffixIcon={<ShopOutlined />}
          options={(shops || []).map((s) => ({ value: s.id, label: (s as any).shop_name ?? s.shop_name }))}
        />
      )}

      {filterMode === 'category' && (
        <Select
          allowClear
          placeholder="Chọn danh mục"
          style={{ width: 240 }}
          value={categoryId}
          onChange={onCategoryChange}
          showSearch
          optionFilterProp="label"
          suffixIcon={<AppstoreOutlined />}
          options={(categories || []).map((c: ICategory) => ({ value: c.id, label: c.name }))}
        />
      )}
    </Space>
  );
};

export default AdminProductFilters;
