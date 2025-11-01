import React, { useEffect, useMemo, useState } from 'react';
import { Input, Table, Tag, Badge } from 'antd';
import { SearchOutlined, StarOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useAttribute } from '@/hooks/useAttribute';
import { useCategory } from '@/hooks/useCategory';

const VendorAttributesPage: React.FC = () => {
  const { slug } = useParams();
  // navigate not used in simplified UI
  const [q, setQ] = useState('');

  const { attributes, isLoading, fetchAttributesOfCategory, fetchHighlightAttributesOfCategory } = useAttribute();
  const { categories, fetchAllCategories } = useCategory();

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  // Map slug to category id for API calls
  const currentCategory = useMemo(() => categories.find((c) => (c as any).slug === slug), [categories, slug]);
  const categoryId = currentCategory?.id as string | undefined;

  useEffect(() => {
    if (!categoryId) return;
    fetchAttributesOfCategory(categoryId);
    fetchHighlightAttributesOfCategory(categoryId);
  }, [categoryId, fetchAttributesOfCategory, fetchHighlightAttributesOfCategory]);

  const attrs = (attributes || []) as IAttribute[];

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return attrs;
    return attrs.filter((a: IAttribute) => a.attributeName.toLowerCase().includes(kw) || a.attributeKey.toLowerCase().includes(kw));
  }, [q, attrs]);

  // currentCategory is already derived by slug above
  const columns = [
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
      render: (type: DataType) => {
        const colorMap: Record<DataType, string> = {
          TEXT: 'blue',
          NUMBER: 'green',
          BOOLEAN: 'orange',
          SELECT: 'purple',
          MULTI_SELECT: 'magenta',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    { 
      title: 'Đơn vị', 
      dataIndex: 'unit', 
      key: 'unit',
      render: (unit: string) => unit ? <Tag>{unit}</Tag> : '—',
    },
    { 
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => desc || '—',
    },
    { 
      title: 'Bắt buộc', 
      dataIndex: 'isRequired', 
      key: 'isRequired', 
      render: (v: boolean) => (
        <Badge 
          status={v ? 'success' : 'default'} 
          text={v ? 'Có' : 'Không'} 
        />
      ),
    },
    { 
      title: 'Nổi bật', 
      dataIndex: 'isHighlight', 
      key: 'isHighlight', 
      render: (v: boolean) => (
        <Badge 
          status={v ? 'warning' : 'default'} 
          text={v ? 'Có' : 'Không'} 
        />
      ),
    },
    {
      title: 'Thứ tự',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 100,
      align: 'center' as const,
    },
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
        dataSource={filtered}
        columns={columns as any}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} thuộc tính` }}
      />
    </div>
  );
};

export default VendorAttributesPage;
