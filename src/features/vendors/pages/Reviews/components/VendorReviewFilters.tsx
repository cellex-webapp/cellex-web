/**
 * Vendor Review Filters Component
 * 
 * Filter controls for the vendor review management page.
 */

import React from 'react';
import { Input, Select, Button, Space, Rate, Tag } from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  StarFilled,
} from '@ant-design/icons';

const { Option } = Select;

interface VendorReviewFiltersProps {
  filters: {
    rating?: number;
    search?: string;
  };
  onFilterChange: (filters: Partial<{
    rating?: number;
    search?: string;
  }>) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

const VendorReviewFilters: React.FC<VendorReviewFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  isLoading = false,
}) => {
  const hasActiveFilters = filters.rating || filters.search;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FilterOutlined className="text-indigo-600" />
        <span className="font-semibold text-gray-700">Bộ lọc</span>
        {hasActiveFilters && (
          <Tag color="blue" className="!ml-2">
            Đang lọc
          </Tag>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder="Tìm theo nội dung hoặc tên khách hàng..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value || undefined })}
            allowClear
            disabled={isLoading}
          />
        </div>

        {/* Rating Filter */}
        <div>
          <Select
            placeholder="Lọc theo số sao"
            value={filters.rating}
            onChange={(value) => onFilterChange({ rating: value })}
            allowClear
            className="w-44"
            disabled={isLoading}
          >
            {[5, 4, 3, 2, 1].map((star) => (
              <Option key={star} value={star}>
                <div className="flex items-center gap-2">
                  <Rate disabled value={star} count={star} className="text-xs !text-yellow-400" />
                  <span className="text-gray-500">({star} sao)</span>
                </div>
              </Option>
            ))}
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            icon={<ClearOutlined />}
            onClick={onClearFilters}
            disabled={isLoading}
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Space wrap>
            <span className="text-sm text-gray-500">Đang lọc:</span>
            {filters.search && (
              <Tag
                closable
                onClose={() => onFilterChange({ search: undefined })}
                color="blue"
              >
                Tìm kiếm: "{filters.search}"
              </Tag>
            )}
            {filters.rating && (
              <Tag
                closable
                onClose={() => onFilterChange({ rating: undefined })}
                color="gold"
                icon={<StarFilled />}
              >
                {filters.rating} sao
              </Tag>
            )}
          </Space>
        </div>
      )}
    </div>
  );
};

export default VendorReviewFilters;
