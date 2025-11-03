import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Table, message, Modal, Tag, Badge } from 'antd';
import { SearchOutlined, PlusOutlined, StarOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { unwrapResult } from '@reduxjs/toolkit';
import { useAttribute } from '@/hooks/useAttribute';
import { useCategory } from '@/hooks/useCategory';
import AttributeFormModal from './AttributeFormModal';

const { confirm } = Modal;

const AttributesPage: React.FC = () => {
  const { slug } = useParams();
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IAttribute | null>(null);

  const { attributes, isLoading, error, fetchAttributesOfCategory, createAttributeOfCategory, updateAttributeOfCategory, deleteAttributeOfCategory, fetchHighlightAttributesOfCategory } = useAttribute();
  const { categories, fetchAllCategories } = useCategory();

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  const currentCategory = useMemo(() => categories.find((c) => (c as any).slug === slug), [categories, slug]);
  const categoryId = currentCategory?.id;

  useEffect(() => {
    if (!categoryId) return;
    fetchAttributesOfCategory(categoryId);
    fetchHighlightAttributesOfCategory(categoryId);
  }, [categoryId, fetchAttributesOfCategory, fetchHighlightAttributesOfCategory]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const attrs = (attributes || []) as IAttribute[];

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return attrs;
    return attrs.filter((a: IAttribute) => a.attributeName.toLowerCase().includes(kw) || a.attributeKey.toLowerCase().includes(kw));
  }, [q, attrs]);

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
      if (!categoryId) throw new Error('Missing categoryId');
      if ('id' in payload) {
        const action = await updateAttributeOfCategory(categoryId, payload as any);
        unwrapResult(action as any);
        message.success('Cập nhật thuộc tính thành công');
      } else {
        const action = await createAttributeOfCategory(categoryId, payload as any);
        unwrapResult(action as any);
        message.success('Tạo thuộc tính thành công');
      }
      closeModal();
    } catch (err: any) {
      message.error(err?.message || 'Không thể lưu thuộc tính');
    }
  };

  const handleDelete = (attr: IAttribute) => {
    confirm({
      title: 'Bạn có chắc muốn xóa thuộc tính này?',
      content: 'Hành động này là soft-delete và chỉ admin có thể thực hiện.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          if (!categoryId) throw new Error('Missing categoryId');
          const action = await deleteAttributeOfCategory(categoryId, attr.id);
          unwrapResult(action as any);
          message.success('Đã xóa thuộc tính');
        } catch (e: any) {
          message.error(e?.message || 'Không thể xóa thuộc tính');
        }
      },
    });
  };

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
    {
      title: 'Hành động',
      key: 'action',
      width: 160,
      render: (_: any, record: IAttribute) => (
          <div className="flex gap-2">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => { e.stopPropagation(); openEdit(record); }}
              title="Sửa thuộc tính"
            />
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => { e.stopPropagation(); handleDelete(record); }}
              title="Xóa thuộc tính"
            />
          </div>
        ),
    },
  ];

  // currentCategory already computed above
  // highlightCount kept for possible future use

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Input
          placeholder="Tìm theo tên hoặc key"
          prefix={<SearchOutlined />}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
          allowClear
        />
        <div>
          <Button className='!bg-indigo-600 cursor-pointer' type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm thuộc tính
          </Button>
        </div>
      </div>

      <Table
        dataSource={filtered}
        columns={columns as any}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} thuộc tính` }}
      />

      <AttributeFormModal open={modalOpen} onClose={closeModal} onSubmit={handleSubmit} editingAttribute={editing} loading={isLoading} />
    </div>
  );
};

export default AttributesPage;
