import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, message } from 'antd';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/categoryApi';
import type { AppCategory, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category.type';
import CategoryTable from '../components/CategoryTable';
import CategoryFormModal from '../components/CategoryFormModal';
import { useNavigate } from 'react-router-dom';

const CategoriesPage: React.FC = () => {
  const [data, setData] = useState<AppCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AppCategory | null>(null);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const list = await getCategories();
      setData(list);
    } catch (e: any) {
      message.error(e?.message || 'Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return data;
    return data.filter((c) => c.name.toLowerCase().includes(kw) || (c.parent?.name || '').toLowerCase().includes(kw));
  }, [q, data]);

  const handleSubmit = async (payload: CreateCategoryRequest | UpdateCategoryRequest, id?: string) => {
    setLoading(true);
    try {
      if (id) {
        await updateCategory(id, payload as UpdateCategoryRequest);
        message.success('Cập nhật danh mục thành công');
      } else {
        await createCategory(payload as CreateCategoryRequest);
        message.success('Tạo danh mục thành công');
      }
      await load();
    } catch (e: any) {
      message.error(e?.message || 'Không thể lưu danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteCategory(id);
      message.success('Đã xoá danh mục');
      await load();
    } catch (e: any) {
      message.error(e?.message || 'Không thể xoá danh mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input placeholder="Tìm theo tên, danh mục cha" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        <Button
          type="primary"
          className="bg-indigo-600"
          onClick={() => navigate('/admin/categories/create')}
        >
          Thêm danh mục
        </Button>
      </div>

      <CategoryTable
        data={filtered}
        loading={loading}
        onEdit={(cat) => {
          setEditing(cat);
          setModalOpen(true);
        }}
        onDelete={handleDelete}
      />

      <CategoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        editing={editing}
        loading={loading}
        categories={data}
      />
    </div>
  );
};

export default CategoriesPage;
