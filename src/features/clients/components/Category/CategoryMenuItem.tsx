import React, { useState } from 'react';
import { type ICategoryTree } from '@/stores/selectors/category.selector';

export interface CategoryMenuItemProps {
  category: ICategoryTree;
  level: number;
  onNavigate?: () => void;
}

export const CategoryMenuItem: React.FC<CategoryMenuItemProps> = ({ category, level, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = !!(category.children && category.children.length > 0);

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren && level >= 0) {
      e.preventDefault();
      setIsOpen((v) => !v);
      return;
    }
    onNavigate?.();
  };

  const baseStyle = level === 0
    ? 'text-gray-800 hover:bg-blue-50 hover:text-blue-600 font-medium'
    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 text-sm';

  const paddingStyle = { paddingLeft: `${level * 10 + 16}px` };

  return (
    <li>
      <a
        href={`/categories/${category.slug}`}
        onClick={handleClick}
        className={`flex items-center justify-between py-2 transition-all duration-200 ${baseStyle}`}
        style={paddingStyle}
        aria-expanded={hasChildren ? isOpen : undefined}
      >
        <span className="truncate">{category.name}</span>
        {hasChildren && (
          <svg
            className={`w-4 h-4 mr-2 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        )}
      </a>

      {hasChildren && (
        <div className={`overflow-hidden transition-[max-height] duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
          <ul className="space-y-0.5">
            {category.children!.map((child) => (
              <CategoryMenuItem
                key={child.id}
                category={child}
                level={level + 1}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};