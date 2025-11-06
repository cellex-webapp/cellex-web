import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, App } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { unwrapResult } from '@reduxjs/toolkit';
import { useNavigate } from 'react-router-dom';
import { useCategory } from '@/hooks/useCategory';
import CategoryTable from './CategoryTable';
import CategoryFormModal from './CategoryFormModal';
import CategoryDetailModal from './CategoryDetailModal';

const CategoriesPageContent: React.FC = () => {
  const { modal, message } = App.useApp();

  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [q, setQ] = useState('');

  const { categories, isLoading, fetchAllCategories, createCategory, updateCategory, deleteCategory } =
    useCategory();

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  const filteredCategories = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(kw));
  }, [q, categories]);

  const handleOpenModalForEdit = (category: ICategory) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleOpenDetail = (id: string) => {
    setDetailId(id);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailId(null);
    setDetailOpen(false);
  };

  const handleCloseModal = () => {
    setEditingCategory(null);
    setModalOpen(false);
  };

  const handleSubmit = async (payload: ICreateCategoryPayload | IUpdateCategoryPayload) => {
    try {
      if ('id' in payload) {
        const actionResult = await updateCategory(payload);
        unwrapResult(actionResult);
        message.success('Cập nhật danh mục thành công');
      } else {
        const actionResult = await createCategory(payload);
        unwrapResult(actionResult);
        message.success('Tạo danh mục thành công');
      }
      handleCloseModal();
    } catch (rejectedValue: any) {
      message.error(rejectedValue || 'Không thể lưu danh mục');
    }
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: 'Bạn có chắc muốn xóa danh mục này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const actionResult = await deleteCategory(id);
          unwrapResult(actionResult);
          message.success('Đã xoá danh mục');
        } catch (rejectedValue: any) {
          message.error(rejectedValue || 'Không thể xoá danh mục');
        }
      },
    });
  };

  const handleManageAttributes = (categorySlug: string) => {
    navigate(`/admin/categories/${categorySlug}/attributes`);
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Input
          placeholder="Tìm theo tên danh mục..."
          prefix={<SearchOutlined />}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
          allowClear
        />
        <Button className='!bg-indigo-600 cursor-pointer' type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Thêm danh mục
        </Button>
      </div>

      <CategoryTable
        data={filteredCategories}
        loading={isLoading}
        onEdit={handleOpenModalForEdit}
        onDelete={handleDelete}
        onRowClick={handleOpenDetail}
        onManageAttributes={handleManageAttributes}
      />

      <CategoryFormModal open={modalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} editingCategory={editingCategory} loading={isLoading} allCategories={categories} />
      <CategoryDetailModal categoryId={detailId} open={detailOpen} onClose={handleCloseDetail} />
    </div>
  );
};

const CategoriesPage: React.FC = () => {
  return (
    <App>
      <CategoriesPageContent />
    </App>
  );
};

export default CategoriesPage;