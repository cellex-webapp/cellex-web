import React, { useEffect, useMemo, useState } from 'react';
import { Drawer, Menu, Popover, Spin } from 'antd';
import type { MenuProps } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useCategory } from '@/hooks/useCategory';
import { type ICategoryTree } from '@/stores/selectors/category.selector';

export const CategoryMegaMenu: React.FC = () => {
  const { categoryTree, isLoading, fetchAllCategories } = useCategory();
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

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
    const cols = 3;
    const res: ICategoryTree[][] = Array.from({ length: cols }, () => []);
    categoryTree.forEach((c, i) => res[i % cols].push(c));
    return res;
  }, [categoryTree]);

  const handleNavigate = () => {
    setPinned(false);
    setOpen(false);
  };

  const toMenuItems = (cats: ICategoryTree[]): MenuProps['items'] =>
    cats.map((cat) => ({
      key: String(cat.id),
      label: (
        <a href={`/category/${cat.slug}`} onClick={handleNavigate} className="text-gray-800">
          {cat.name}
        </a>
      ),
      children: cat.children && cat.children.length > 0 ? (toMenuItems(cat.children) as any) : undefined,
    }));

  const onTriggerClick = () => {
    if (pinned) {
      setPinned(false);
      setOpen(false);
    } else {
      setPinned(true);
      setOpen(true);
    }
  };

  const content = (
    <div
      className="w-[960px] bg-white rounded-xl shadow-2xl border border-gray-100"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        if (!pinned) setOpen(false);
      }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <div className="font-semibold text-gray-800 text-xl p-4">Danh mục sản phẩm</div>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-10"><Spin /></div>
        ) : (
          <div className="flex gap-6">
            {chunked.map((col, colIdx) => (
              <div key={colIdx} className="flex-1 min-w-0">
                <div className="space-y-4">
                  {col.map((cat) => (
                    <div key={cat.id} className="">
                      <a
                        href={`/category/${cat.slug}`}
                        className="block text-gray-900 font-semibold hover:text-blue-600 transition-colors truncate"
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
                                href={`/category/${child.slug}`}
                                className="block text-sm text-gray-600 hover:text-blue-600 py-0.5 transition-colors truncate"
                                onClick={handleNavigate}
                                title={child.name}
                              >
                                {child.name}
                              </a>
                              {child.children && child.children.length > 0 && (
                                <ul className="mt-1 pl-3 border-l border-gray-100">
                                  {child.children.map((grand) => (
                                    <li key={grand.id}>
                                      <a
                                        href={`/category/${grand.slug}`}
                                        className="block text-xs text-gray-500 hover:text-blue-600 py-0.5 transition-colors truncate"
                                        onClick={handleNavigate}
                                        title={grand.name}
                                      >
                                        {grand.name}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              )}
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
      {/* Desktop trigger + controlled Popover */}
      <div className="hidden lg:block">
        <Popover
          placement="bottomLeft"
          open={open && !isMobile}
          onOpenChange={(next) => {
            if (pinned && !next) return; // ignore hover-out when pinned
            setOpen(next);
          }}
          trigger={["hover", "click"]}
          overlayInnerStyle={{ padding: 0 }}
          content={content}
        >
          <button
            onMouseEnter={() => { if (!pinned) setOpen(true); }}
            onClick={onTriggerClick}
            className="flex items-center gap-2 px-4 md:px-6 h-9 md:h-10 text-sm md:text-base font-semibold rounded-full bg-indigo-600 !text-white hover:bg-indigo-700 no-underline min-w-fit cursor-pointer"
            type="button"
          >
            <MenuOutlined className="text-base md:text-lg" />
            <span className="hidden sm:inline">Danh mục</span>
          </button>
        </Popover>
      </div>

      {/* Mobile drawer */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 md:px-6 h-9 md:h-10 text-sm md:text-base font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700 no-underline min-w-fit"
          type="button"
        >
          <MenuOutlined className="text-base md:text-lg" />
          <span className="hidden sm:inline">Danh mục</span>
        </button>
        <Drawer
          width={320}
          title="Danh mục sản phẩm"
          placement="left"
          open={open && isMobile}
          onClose={() => { setOpen(false); setPinned(false); }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-10"><Spin /></div>
          ) : (
            <Menu mode="inline" items={toMenuItems(categoryTree)} />
          )}
        </Drawer>
      </div>
    </>
  );
};