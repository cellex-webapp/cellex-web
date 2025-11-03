import React, { useEffect } from 'react';
import CategoryCard from './CategoryCard';
import { useCategory } from '@/hooks/useCategory';
import { Spin, Empty } from 'antd';

interface Props {
    title?: string;
}
const CategoryList: React.FC<Props> = ({ title }) => {
  const { categories, isLoading, fetchAllCategories } = useCategory();

  useEffect(() => {
    if (!categories || categories.length === 0) fetchAllCategories();
  }, [categories, fetchAllCategories]);

  if (isLoading) return <div className="py-6"><Spin /></div>;

  if (!categories || categories.length === 0) return <Empty description="Không có danh mục" />;

  return (
    <div className="py-4">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      <div className="flex gap-6 items-start overflow-x-auto scrollbar-hide px-2 py-2">
        {categories.map((c) => (
          <div key={c.id} className="flex-shrink-0">
            <CategoryCard category={c} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
