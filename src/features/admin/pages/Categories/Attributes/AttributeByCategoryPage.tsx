import React, { useEffect, useState } from 'react';
import { App, Input, Spin, Table, Tag, Badge, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useCategory } from '@/hooks/useCategory';
import { attributeService } from '@/services/attribute.service';

type AttrCache = {
  loading: boolean;
  error?: string | null;
  items: IAttribute[];
};

const AttributeByCategoryPage: React.FC = () => {
  const { message } = App.useApp();
  const { categories, isLoading, fetchAllCategories } = useCategory();
  const [q, setQ] = useState('');
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [attrByCat, setAttrByCat] = useState<Record<string, AttrCache>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAllCategories({ search: q });
    }, 500);
    return () => clearTimeout(timer);
  }, [q, fetchAllCategories]);

  const ensureLoadAttributes = async (categoryId: string) => {
    if (attrByCat[categoryId]?.items.length > 0) return;

    setAttrByCat((prev) => ({
      ...prev,
      [categoryId]: { ...(prev[categoryId] ?? { items: [] }), loading: true, error: null },
    }));

    try {
      const resp = await attributeService.getAttributesOfCategory(categoryId, { 
        page: 1, 
        limit: 100 
      });

      const items = resp.result?.content || [];
      
      setAttrByCat((prev) => ({ 
        ...prev, 
        [categoryId]: { loading: false, error: null, items } 
      }));

    } catch (e: any) {
      const errMsg = e?.response?.data?.message ?? e?.message ?? 'Lỗi tải thuộc tính';
      setAttrByCat((prev) => ({ 
        ...prev, 
        [categoryId]: { loading: false, error: errMsg, items: [] } 
      }));
      message.error(errMsg);
    }
  };

  const onExpand = async (expanded: boolean, record: ICategory) => {
    const id = record.id;
    setExpandedRowKeys((prev) => (expanded ? [...prev, id] : prev.filter((k) => k !== id)));
    
    if (expanded) {
      await ensureLoadAttributes(id);
    }
  };

  const columns: ColumnsType<ICategory> = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 80,
      render: (url: string) =>
        url ? (
          <div className="w-10 h-10 rounded border overflow-hidden">
             <img src={url} alt="thumb" className="w-full h-full object-cover" />
          </div>
        ) : <div className="w-10 h-10 bg-gray-100 rounded border" />,
    },
    { 
      title: 'Tên danh mục', 
      dataIndex: 'name', 
      key: 'name',
      render: (text) => <span className="font-semibold">{text}</span>
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      className: 'text-gray-400'
    }
  ];

  const expandedRowRender = (cat: ICategory) => {
    const cache = attrByCat[cat.id];

    if (!cache || cache.loading) {
      return <div className="py-4 text-center"><Spin /></div>;
    }

    if (cache.error) {
      return <div className="py-2 text-red-500 text-sm">Lỗi: {cache.error}</div>;
    }

    const attrs = cache.items || [];

    if (attrs.length === 0) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có thuộc tính nào" />;
    }

    const cols: ColumnsType<IAttribute> = [
      {
        title: 'Tên thuộc tính',
        dataIndex: 'attributeName',
        key: 'attributeName',
        width: '25%',
      },
      {
        title: 'Key',
        dataIndex: 'attributeKey',
        key: 'attributeKey',
        render: (text) => <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{text}</code>
      },
      {
        title: 'Loại',
        dataIndex: 'dataType',
        key: 'dataType',
        render: (type: string) => <Tag>{type}</Tag>,
      },
      {
        title: 'Required',
        dataIndex: 'isRequired',
        key: 'isRequired',
        render: (v: boolean) => v ? <Badge status="success" text="Có" /> : <span className="text-gray-400">Không</span>
      },
      { 
         title: 'Sort', 
         dataIndex: 'sortOrder', 
         key: 'sortOrder' 
      },
    ];

    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="mb-2 text-sm font-semibold text-gray-600">Danh sách thuộc tính ({attrs.length})</h4>
        <Table
          size="small"
          rowKey="id"
          columns={cols}
          dataSource={attrs}
          pagination={false}
          bordered
          className="bg-white"
        />
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Input
          placeholder="Tìm danh mục..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
          allowClear
        />
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={categories} 
        columns={columns}
        expandable={{
          expandedRowKeys,
          onExpand,
          expandedRowRender,
          expandRowByClick: true,
        }}
        onRow={() => ({
          onClick: () => {
          },
          className: 'cursor-pointer'
        })}
        pagination={{ 
            pageSize: 10, 
            showSizeChanger: true, 
            showTotal: (total) => `Tổng ${total} danh mục` 
        }}
      />
    </div>
  );
};

export default AttributeByCategoryPage;