import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Table, message, Modal, Tag, Badge, Space, Tooltip } from 'antd';
import { SearchOutlined, PlusOutlined, StarOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { unwrapResult } from '@reduxjs/toolkit';
import type { TablePaginationConfig } from 'antd/es/table';
import { useAttribute } from '@/hooks/useAttribute';
import { useCategory } from '@/hooks/useCategory';
import AttributeFormModal from './AttributeFormModal';

const { confirm } = Modal;

const AttributesPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IAttribute | null>(null);

  const { 
    attributes, 
    pagination, 
    isLoading, 
    error, 
    getAttributes, 
    createAttribute, 
    updateAttribute, 
    deleteAttribute, 
    getHighlightAttributes 
  } = useAttribute();

  const { categories, fetchAllCategories } = useCategory();

  useEffect(() => {
    if (categories.length === 0) {
      fetchAllCategories(); 
    }
  }, [fetchAllCategories, categories.length]);

  const currentCategory = useMemo(() => categories.find((c) => c.slug === slug), [categories, slug]);
  const categoryId = currentCategory?.id;

  useEffect(() => {
    if (!categoryId) return;

    const timer = setTimeout(() => {
      getAttributes(categoryId, { 
        page: 1, 
        limit: pagination.limit, 
        search: q 
      });
      getHighlightAttributes(categoryId);
    }, 500);

    return () => clearTimeout(timer);
  }, [categoryId, q, getAttributes, getHighlightAttributes]); 

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    if (!categoryId) return;
    getAttributes(categoryId, {
      page: newPagination.current,
      limit: newPagination.pageSize,
      search: q,
    });
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (attr: IAttribute) => {
    setEditing(attr);
    setModalOpen(true);
  };

  const closeModal = () => {
    setEditing(null);
    setModalOpen(false);
  };

  const handleSubmit = async (payload: ICreateUpdateAttributePayload | (ICreateUpdateAttributePayload & { id: string })) => {
    try {
      if (!categoryId) return;
      
      let action;
      if ('id' in payload) {
        action = await updateAttribute(categoryId, payload as ICreateUpdateAttributePayload & { id: string });
        message.success('Cập nhật thuộc tính thành công');
      } else {
        action = await createAttribute(categoryId, payload as ICreateUpdateAttributePayload);
        message.success('Tạo thuộc tính thành công');
      }
      
      unwrapResult(action);
      closeModal();
    } catch (err: unknown) {}
  };

  const handleDelete = (attr: IAttribute) => {
    confirm({
      title: 'Xóa thuộc tính?',
      content: `Bạn có chắc muốn xóa thuộc tính "${attr.attributeName}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          if (!categoryId) return;
          const action = await deleteAttribute(categoryId, attr.id);
          unwrapResult(action);
          message.success('Đã xóa thuộc tính');
        } catch (e: any) {
          message.error(typeof e === 'string' ? e : 'Không thể xóa thuộc tính');
        }
      },
    });
  };

  const columns: any = [
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
      render: (text: string) => <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">{text}</code>,
    },
    { 
      title: 'Loại dữ liệu', 
      dataIndex: 'dataType', 
      key: 'dataType',
      render: (type: string) => { 
        const colorMap: Record<string, string> = {
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
      render: (unit: string) => unit ? <Tag>{unit}</Tag> : <span className="text-gray-300">—</span>,
    },
    { 
      title: 'Cấu hình',
      key: 'config',
      render: (_: any, record: IAttribute) => (
        <Space direction="vertical" size={0}>
           <Badge status={record.isRequired ? 'success' : 'default'} text={record.isRequired ? 'Bắt buộc' : 'Tùy chọn'} />
           <Badge status={record.isHighlight ? 'warning' : 'default'} text={record.isHighlight ? 'Nổi bật' : 'Thường'} />
        </Space>
      )
    },
    {
      title: 'Thứ tự',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      align: 'center',
      width: 80,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      align: 'right',
      render: (_: any, record: IAttribute) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              className="text-blue-600 hover:bg-blue-50"
              onClick={(e) => { e.stopPropagation(); openEdit(record); }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              className="hover:bg-red-50"
              onClick={(e) => { e.stopPropagation(); handleDelete(record); }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold mb-1">
             Thuộc tính: {currentCategory?.name || <span className="text-gray-400">Đang tải...</span>}
          </h2>
          <p className="text-gray-500 text-sm">Quản lý các thuộc tính kỹ thuật cho danh mục này.</p>
        </div>
        
        <div className="flex gap-3">
            <Input
              placeholder="Tìm thuộc tính..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-64"
              allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} disabled={!categoryId}>
              Thêm mới
            </Button>
        </div>
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
            showTotal: (total) => `Tổng ${total} thuộc tính`
        }}
        onChange={handleTableChange}
        scroll={{ x: 800 }}
      />

      <AttributeFormModal 
        open={modalOpen} 
        onClose={closeModal} 
        onSubmit={handleSubmit} 
        editingAttribute={editing} 
        loading={isLoading} 
      />
    </div>
  );
};

export default AttributesPage;