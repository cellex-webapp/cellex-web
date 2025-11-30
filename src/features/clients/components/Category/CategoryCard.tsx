import React from 'react';
import { Link } from 'react-router-dom';
import { Image } from 'antd';

interface Props {
  category: ICategory;
}

const CategoryCard: React.FC<Props> = ({ category }) => {
  const img = (category as any)?.imageUrl || (category as any)?.image || '';

  return (
    <Link to={`/categories/${category.slug || category.id}`} className="no-underline">
      <div className="flex flex-col items-center gap-2 w-24 md:w-28 text-center">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-white flex items-center justify-center overflow-hidden">
          {img ? (
            <Image src={img} preview={false} alt={category.name} className="object-contain w-full h-full" />
          ) : (
            <div className="text-gray-300">📦</div>
          )}
        </div>
        <div className="text-xs md:text-sm text-gray-700 truncate" title={category.name}>{category.name}</div>
      </div>
    </Link>
  );
};

export default CategoryCard;
