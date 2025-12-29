import React, { useEffect, useState } from 'react';
import CategoryCard from './CategoryCard';
import { useCategory } from '@/hooks/useCategory';
import { Spin, Empty } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

interface Props {
  title?: string;
}

const CategoryList: React.FC<Props> = ({ title }) => {
  const { categories, isLoading, fetchAllCategories } = useCategory();
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    if (categories.length === 0) {
      fetchAllCategories();
    }
  }, [categories.length, fetchAllCategories]); 

  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < totalPages - 1;

  const handlePrev = () => {
    if (canGoBack) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (canGoForward) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const visibleCategories = categories.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  if (isLoading) return <div className="py-6 flex justify-center"><Spin /></div>;
  if (categories.length === 0) return <Empty description="Không có danh mục" />;
  
  return (
    <div className="py-6 bg-white rounded-lg shadow-sm max-w-4xl mx-auto">
      {title && <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{title}</h2>}
      
      <div className="relative px-4 md:px-12">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={!canGoBack}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 ${
            canGoBack 
              ? 'text-blue-600 hover:text-blue-700 cursor-pointer' 
              : 'text-gray-300 cursor-not-allowed'
          }`}
          aria-label="Trước"
        >
          <LeftOutlined className="text-2xl md:text-3xl" />
        </button>

        {/* Categories Grid */}
        <div className="flex justify-center items-center gap-4 md:gap-6 px-12 md:px-16 min-h-[140px]">
          {visibleCategories.map((c) => (
            <div key={c.id} className="flex-shrink-0">
              <CategoryCard category={c} />
            </div>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!canGoForward}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 ${
            canGoForward 
              ? 'text-blue-600 hover:text-blue-700 cursor-pointer' 
              : 'text-gray-300 cursor-not-allowed'
          }`}
          aria-label="Tiếp"
        >
          <RightOutlined className="text-2xl md:text-3xl" />
        </button>
      </div>

      {/* Pagination Dots */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-8 h-2 bg-blue-600'
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Trang ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;