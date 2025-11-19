import React, { useEffect, useMemo, useState } from 'react';
import { Drawer, Popover, Spin } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useCategory } from '@/hooks/useCategory';
import { type ICategoryTree } from '@/stores/selectors/category.selector';
import { CategoryMenuItem } from './CategoryMenuItem';

export const CategoryMegaMenu: React.FC = () => {
  const { categoryTree, isLoading, fetchAllCategories } = useCategory();
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (categoryTree.length === 0) {
      fetchAllCategories();
    }
  }, [categoryTree.length, fetchAllCategories]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (open && isMobile) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [open, isMobile]);

  const chunked = useMemo(() => {
    if (!categoryTree || categoryTree.length === 0) return [];
    const cols = 3;
    const res: ICategoryTree[][] = Array.from({ length: cols }, () => []);
    categoryTree.forEach((c, i) => res[i % cols].push(c));
    return res;
  }, [categoryTree]);

  const handleNavigate = () => {
    setPinned(false);
    setOpen(false);
  };

  const onTriggerClick = () => {
    setPinned((p) => !p);
    setOpen((o) => !o);
  };

  const MobileMenuContent: React.FC<{ data: ICategoryTree[] }> = ({ data }) => (
    <ul className="space-y-1 py-2">
      {data.map((cat) => (
        <CategoryMenuItem
          key={cat.id}
          category={cat}
          level={0}
          onNavigate={handleNavigate}
        />
      ))}
    </ul>
  );

  const DesktopContent = (
    <div
      className="w-[960px] bg-white rounded-xl shadow-2xl border border-gray-100"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => { if (!pinned) setOpen(false); }}
    >
      <div className="font-semibold text-gray-800 text-xl p-4 border-b border-gray-100">Danh mục sản phẩm</div>
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-10"><Spin /></div>
        ) : (
          <div className="flex gap-6">
            {chunked.map((col, colIdx) => (
              <div key={colIdx} className="flex-1 min-w-0">
                <div className="space-y-4">
                  {col.map((cat) => (
                    <div key={cat.id} className="border-b border-gray-50 pb-3 last:border-b-0">
                      <a
                        href={`/categories/${cat.slug}`}
                        className="block text-gray-900 font-semibold hover:text-blue-600 transition-colors truncate text-base"
                        onClick={handleNavigate}
                        title={cat.name}
                      >
                        {cat.name}
                      </a>

                      {cat.children && cat.children.length > 0 && (
                        <ul className="mt-2 space-y-1 pl-3 border-l-2 border-gray-100 max-h-48 overflow-y-auto">
                          {cat.children.map((child) => (
                            <li key={child.id}>
                              <a
                                href={`/categories/${child.slug}`}
                                className="block text-sm text-gray-600 hover:text-blue-600 py-0.5 transition-colors truncate"
                                onClick={handleNavigate}
                                title={child.name}
                              >
                                {child.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block">
        <Popover
          placement="bottomLeft"
          open={open && !isMobile}
          onOpenChange={(next) => { if (pinned && !next) return; setOpen(next); }}
          trigger={["hover", "click"]}
          overlayInnerStyle={{ padding: 0 }}
          content={DesktopContent}
        >
          <button
            onMouseEnter={() => { if (!pinned) setOpen(true); }}
            onClick={onTriggerClick}
            className="flex items-center gap-2 px-6 h-10 font-semibold rounded-full bg-indigo-600 !text-white hover:bg-indigo-700 min-w-fit cursor-pointer transition-colors"
            type="button"
          >
            <MenuOutlined className="text-lg" />
            <span>Danh mục</span>
          </button>
        </Popover>
      </div>

      <div className="lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 h-9 font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700 min-w-fit transition-colors"
          type="button"
        >
          <MenuOutlined className="text-base" />
          <span>Danh mục</span>
        </button>
        <Drawer
          width={300}
          title="Danh mục sản phẩm"
          placement="left"
          open={open && isMobile}
          onClose={() => { setOpen(false); setPinned(false); }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-10"><Spin /></div>
          ) : (
            <MobileMenuContent data={categoryTree} />
          )}
        </Drawer>
      </div>
    </>
  );
};