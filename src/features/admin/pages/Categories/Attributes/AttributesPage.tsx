import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Table, message, Modal } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { unwrapResult } from '@reduxjs/toolkit';
import { useAttribute } from '@/hooks/useAttribute';
import AttributeFormModal from './AttributeFormModal';

const { confirm } = Modal;

const AttributesPage: React.FC = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IAttribute | null>(null);

  const { attributes, isLoading, error, fetchAttributesOfCategory, createAttributeOfCategory, updateAttributeOfCategory, deleteAttributeOfCategory, fetchHighlightAttributesOfCategory } = useAttribute();

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
    { title: 'Tên', dataIndex: 'attributeName', key: 'attributeName' },
    { title: 'Key', dataIndex: 'attributeKey', key: 'attributeKey' },
    { title: 'Loại dữ liệu', dataIndex: 'dataType', key: 'dataType' },
    { title: 'Bắt buộc', dataIndex: 'isRequired', key: 'isRequired', render: (v: boolean) => (v ? 'Có' : 'Không') },
    { title: 'Nổi bật', dataIndex: 'isHighlight', key: 'isHighlight', render: (v: boolean) => (v ? 'Có' : 'Không') },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: IAttribute) => (
        <div className="flex gap-2">
          <Button size="small" onClick={() => openEdit(record)}>Sửa</Button>
          <Button size="small" danger onClick={() => handleDelete(record)}>Xóa</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input placeholder="Tìm theo tên hoặc key" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        <div className="flex gap-2">
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
          <Button type="primary" onClick={openCreate} className="!bg-indigo-600">Thêm thuộc tính</Button>
        </div>
      </div>

      <Table dataSource={filtered} columns={columns as any} rowKey="id" loading={isLoading} />

      <AttributeFormModal open={modalOpen} onClose={closeModal} onSubmit={handleSubmit} editingAttribute={editing} loading={isLoading} />
    </div>
  );
};

export default AttributesPage;
