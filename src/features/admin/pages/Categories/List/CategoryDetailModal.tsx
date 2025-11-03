import React, { useEffect, useState } from 'react';
import { Modal, Descriptions, Spin, message } from 'antd';
import { categoryService } from '@/services/category.service';

interface Props {
  categoryId: string | null;
  open: boolean;
  onClose: () => void;
}

const CategoryDetailModal: React.FC<Props> = ({ categoryId, open, onClose }) => {
  const [category, setCategory] = useState<ICategory | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !categoryId) return;
    let mounted = true;
    const fetch = async () => {
      try {
        setLoading(true);
        const resp = await categoryService.getCategoryById(categoryId);
        if (!mounted) return;
        setCategory(resp.result ?? null);
      } catch (err: any) {
        message.error(err?.message ?? 'Không thể tải thông tin danh mục');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, [open, categoryId]);

  return (
    <Modal
      title="Chi tiết danh mục"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
    >
      {loading ? (
        <div className="text-center">
          <Spin />
        </div>
      ) : category ? (
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Tên">{category.name}</Descriptions.Item>
          <Descriptions.Item label="Slug">{category.slug}</Descriptions.Item>
          <Descriptions.Item label="Danh mục cha">{category.parent || '-'}</Descriptions.Item>
          <Descriptions.Item label="Mô tả">{category.description || '-'}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">{category.isActive ? 'Hoạt động' : 'Ngừng'}</Descriptions.Item>
          <Descriptions.Item label="Ảnh">
            {category.imageUrl ? <img src={category.imageUrl} alt="thumb" style={{ maxWidth: 200 }} /> : '-'}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <div>Không có dữ liệu</div>
      )}
    </Modal>
  );
};

export default CategoryDetailModal;
