import React, { useEffect, useState } from 'react';
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

  const {
    categories,
    isLoading,
    fetchAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
  } = useCategory();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAllCategories({ sortBy: 'createdAt', sortType: 'desc' });
    }, 500);

    return () => clearTimeout(timer);
  }, [q, fetchAllCategories]);

  const handleOpenModalForEdit = (category: ICategory) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingCategory(null);
    setModalOpen(false);
  };

  const handleOpenDetail = (id: string) => {
    setDetailId(id);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailId(null);
    setDetailOpen(false);
  };

  const handleSubmit = async (payload: ICreateCategoryPayload | IUpdateCategoryPayload) => {
    try {
      let actionResult;
      if ('id' in payload) {
        actionResult = await updateCategory(payload as IUpdateCategoryPayload);
        message.success('Cập nhật danh mục thành công');
      } else {
        actionResult = await createCategory(payload as ICreateCategoryPayload);
        message.success('Tạo danh mục thành công');
      }
      unwrapResult(actionResult);
      handleCloseModal();

    } catch (err: unknown) { }
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      centered: true,
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa danh mục này? Hành động không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const result = await deleteCategory(id);
          unwrapResult(result);
          message.success('Đã xoá danh mục');
        } catch (error: any) {
          message.error(error as string || 'Không thể xoá danh mục');
        }
      },
    });
  };

  const handleManageAttributes = (categorySlug: string) => {
    navigate(`/admin/categories/${categorySlug}/attributes`);
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder="Tìm kiếm danh mục..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
          allowClear
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
          className="bg-indigo-600 hover:!bg-indigo-500"
        >
          Thêm danh mục
        </Button>
      </div>

      <CategoryTable
        data={categories}
        loading={isLoading}
        onEdit={handleOpenModalForEdit}
        onDelete={handleDelete}
        onRowClick={handleOpenDetail}
        onManageAttributes={handleManageAttributes}
      />

      <CategoryFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingCategory={editingCategory}
        loading={isLoading}
        allCategories={categories}
      />

      <CategoryDetailModal
        categoryId={detailId}
        open={detailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  );
};

const CategoriesPage: React.FC = () => (
  <App>
    <CategoriesPageContent />
  </App>
);

export default CategoriesPage;