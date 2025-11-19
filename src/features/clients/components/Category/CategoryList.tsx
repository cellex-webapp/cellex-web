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
    if (categories.length === 0) {
      fetchAllCategories();
    }
  }, [categories.length, fetchAllCategories]); 

  if (isLoading) return <div className="py-6 flex justify-center"><Spin /></div>;
  if (categories.length === 0) return <Empty description="Không có danh mục" />;
  return (
    <div className="py-4">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      <div className="flex gap-4 items-start overflow-x-auto scrollbar-hide">
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