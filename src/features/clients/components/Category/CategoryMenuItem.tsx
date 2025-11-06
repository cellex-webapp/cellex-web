
import React, { useState } from 'react';
import { type ICategoryTree } from '@/stores/selectors/category.selector';

export interface CategoryMenuItemProps {
  category: ICategoryTree;
  level?: number;
  onNavigate?: () => void;
}

export const CategoryMenuItem: React.FC<CategoryMenuItemProps> = ({ category, level = 0, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = !!(category.children && category.children.length > 0);

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren && level > 0) {
      e.preventDefault();
      setIsOpen((v) => !v);
      return;
    }
    onNavigate?.();
  };

  return (
    <li className={`relative ${hasChildren ? 'has-children' : ''}`}>
      <a
        href={`/categories/${category.slug}`}
        onClick={handleClick}
        className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
          level === 0
            ? 'text-gray-800 hover:bg-blue-50 hover:text-blue-600 font-medium'
            : level === 1
            ? 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium text-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 text-sm'
        }`}
        aria-expanded={hasChildren ? isOpen : undefined}
      >
        <span className="truncate">{category.name}</span>
        {hasChildren && (
          <svg
            className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </a>

      {hasChildren && level > 0 && (
        <div className={`ml-4 mt-2 overflow-hidden transition-[max-height] duration-200 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
          <ul className="space-y-1">
            {category.children!.map((child) => (
              <CategoryMenuItem key={child.id} category={child} level={level + 1} onNavigate={onNavigate} />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};