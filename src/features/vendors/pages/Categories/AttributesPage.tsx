import React, { useEffect, useMemo, useState } from 'react';
import { Input, Table, Tag, Badge } from 'antd';
import { SearchOutlined, StarOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useAttribute } from '@/hooks/useAttribute';
import { useCategory } from '@/hooks/useCategory';
import { useDebounce } from '@/hooks/useDebounce'; 
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';

const VendorAttributesPage: React.FC = () => {
  const { slug } = useParams();
  const [q, setQ] = useState('');
  const debouncedQ = useDebounce(q, 350);

  const { 
    attributes, 
    pagination, 
    isLoading, 
    getAttributes, 
    getHighlightAttributes 
  } = useAttribute();
  
  const { categories, fetchAllCategories } = useCategory();

  useEffect(() => {
    if (categories.length === 0) fetchAllCategories();
  }, [categories.length, fetchAllCategories]);

  const currentCategory = useMemo(() => categories.find((c) => c.slug === slug), [categories, slug]);
  const categoryId = currentCategory?.id;

  useEffect(() => {
    if (!categoryId) return;
    
    getAttributes(categoryId, { 
      page: 1, 
      limit: pagination.limit, 
      search: debouncedQ 
    });
    getHighlightAttributes(categoryId);
  }, [categoryId, debouncedQ, getAttributes, getHighlightAttributes]); 

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    if (!categoryId) return;
    getAttributes(categoryId, {
      page: newPagination.current,
      limit: newPagination.pageSize,
      search: debouncedQ,
    });
  };

  const columns: ColumnsType<IAttribute> = [
    { 
      title: 'Tên thuộc tính', 
      dataIndex: 'attributeName', 
      key: 'attributeName',
      render: (text: string, record: IAttribute) => (
        <div className="flex items-center gap-2">
          {record.isHighlight && <StarOutlined className="text-yellow-500" />}
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    { 
      title: 'Key', 
      dataIndex: 'attributeKey', 
      key: 'attributeKey',
      render: (text: string) => <code className="px-2 py-1 bg-gray-100 rounded text-sm">{text}</code>,
    },
    { 
      title: 'Loại dữ liệu', 
      dataIndex: 'dataType', 
      key: 'dataType',
      render: (type: string) => (
        <Tag color="blue">{type}</Tag>
      ),
    },
    { title: 'Đơn vị', dataIndex: 'unit', key: 'unit', render: (u) => u || '—' },
    { 
      title: 'Bắt buộc', 
      dataIndex: 'isRequired', 
      key: 'isRequired', 
      render: (v: boolean) => <Badge status={v ? 'success' : 'default'} text={v ? 'Có' : 'Không'} />,
    },
    { 
      title: 'Nổi bật', 
      dataIndex: 'isHighlight', 
      key: 'isHighlight', 
      render: (v: boolean) => <Badge status={v ? 'warning' : 'default'} text={v ? 'Có' : 'Không'} />,
    },
    { title: 'Thứ tự', dataIndex: 'sortOrder', key: 'sortOrder', width: 80, align: 'center' },
  ];

  return (
    <div className="p-4">
      <div className="mb-4">
        <Input
          placeholder="Tìm theo tên hoặc key"
          prefix={<SearchOutlined />}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
          allowClear
        />
      </div>

      <Table
        dataSource={attributes}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (t) => `Tổng ${t} thuộc tính`
        }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default VendorAttributesPage;