import React from "react";
import { Button, Input, Space } from "antd";

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  onRefresh: () => void;
  onCreate: () => void;
}

const CategoryHeader: React.FC<Props> = ({ query, onQueryChange, onRefresh, onCreate }) => {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
      <div>
        <h1 className="text-xl font-semibold">Quản lý danh mục sản phẩm</h1>
        <p className="text-gray-500 text-sm">Danh sách, tạo mới, chỉnh sửa và xóa danh mục</p>
      </div>
      <Space>
        <Input.Search
          placeholder="Tìm theo tên"
          allowClear
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onSearch={onQueryChange}
          className="w-56"
        />
        <Button onClick={onRefresh}>Làm mới</Button>
        <Button type="primary" onClick={onCreate}>
          Thêm danh mục
        </Button>
      </Space>
    </div>
  );
};

export default CategoryHeader;
