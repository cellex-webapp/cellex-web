import React, { useState } from 'react';
import { Segmented, Typography } from 'antd';
import { DesktopOutlined, MobileOutlined, HolderOutlined } from '@ant-design/icons';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CanvasBlock } from '../ShopThemeBuilderPage';

const { Text } = Typography;

type PreviewMode = 'desktop' | 'mobile';

interface PreviewCanvasProps {
  blocks: CanvasBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

/* ------------------------------------------------------------------ */
/*  Dynamic block renderer                                            */
/* ------------------------------------------------------------------ */

const DynamicBlockRenderer: React.FC<{
  block: CanvasBlock;
  primaryColor: string;
  isSelected: boolean;
}> = ({ block, primaryColor }) => {
  const data = block.data ?? {};

  switch (block.type) {
    case 'banner': {
      const imgUrl = data.imageUrl as string | undefined;
      const linkUrl = data.linkUrl as string | undefined;
      return (
        <div className="bg-slate-100 rounded h-48 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt="Banner"
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <>
              <div className="text-3xl">🖼️</div>
              <span>{block.label}</span>
              {linkUrl && (
                <span className="text-xs text-indigo-400 truncate max-w-full px-2">
                  → {linkUrl}
                </span>
              )}
            </>
          )}
        </div>
      );
    }

    case 'grid': {
      const title = (data.title as string) || block.label;
      const displayCount = (data.displayCount as number) || 4;
      return (
        <div>
          <Text type="secondary" className="text-xs mb-2 block">
            {title}
          </Text>
          <div
            className={`grid gap-3 ${
              displayCount <= 2
                ? 'grid-cols-2'
                : displayCount <= 4
                ? 'grid-cols-4'
                : 'grid-cols-5'
            }`}
          >
            {[...Array(displayCount)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-50 rounded h-32 border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400"
              >
                Sản phẩm {i + 1}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'video':
      return (
        <div className="bg-slate-800 rounded h-64 flex items-center justify-center text-white/60 text-sm">
          <div className="text-center">
            <div className="text-lg mb-1">&#9654;</div>
            {block.label}
          </div>
        </div>
      );

    case 'text':
      return (
        <div className="bg-slate-50 rounded p-6 border border-dashed border-slate-200">
          <Text type="secondary" className="text-sm">
            {block.label}
          </Text>
          <div className="mt-2 space-y-1">
            <div className="h-2 bg-slate-200 rounded w-full" />
            <div className="h-2 bg-slate-200 rounded w-3/4" />
            <div className="h-2 bg-slate-200 rounded w-5/6" />
          </div>
        </div>
      );

    case 'list':
      return (
        <div className="bg-slate-50 rounded p-4 border border-dashed border-slate-200">
          <Text type="secondary" className="text-xs block mb-2">
            {block.label}
          </Text>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 bg-slate-100 rounded mb-1 last:mb-0" />
          ))}
        </div>
      );

    case 'cta':
      return (
        <div className="flex justify-center py-4">
          <div
            className="px-8 py-3 rounded font-semibold text-white text-sm"
            style={{ backgroundColor: primaryColor }}
          >
            {block.label}
          </div>
        </div>
      );

    default:
      return (
        <div className="bg-slate-50 rounded p-4 border border-dashed border-slate-200 text-slate-400 text-sm text-center">
          {block.label}
        </div>
      );
  }
};

/* ------------------------------------------------------------------ */
/*  Sortable canvas block item                                        */
/* ------------------------------------------------------------------ */

const SortableBlockItem: React.FC<{
  block: CanvasBlock;
  primaryColor: string;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ block, primaryColor, isSelected, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-sm cursor-pointer transition-shadow ${
        isSelected
          ? 'ring-2 ring-indigo-500 border-transparent shadow-md'
          : 'hover:shadow-sm'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-7 top-1/2 -translate-y-1/2 w-5 h-8 flex items-center justify-center bg-white border border-slate-200 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <HolderOutlined className="text-slate-400 text-xs" />
      </div>

      <DynamicBlockRenderer
        block={block}
        primaryColor={primaryColor}
        isSelected={isSelected}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Empty canvas state                                                */
/* ------------------------------------------------------------------ */

const EmptyCanvas: React.FC = () => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center text-slate-400 select-none pointer-events-none">
      <div className="text-4xl mb-3 opacity-30">+</div>
      <Text type="secondary">Kéo thành phần từ bên trái vào đây</Text>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Canvas component                                                  */
/* ------------------------------------------------------------------ */

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  blocks,
  selectedBlockId,
  onSelectBlock,
  primaryColor = '#1677FF',
  secondaryColor = '#FFFFFF',
  fontFamily = 'Inter',
}) => {
  const [mode, setMode] = useState<PreviewMode>('desktop');
  const isMobile = mode === 'mobile';

  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone' });

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-100 min-w-0">
      {/* Toolbar */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
        <Text strong className="text-sm">
          Xem trước
        </Text>
        <Segmented
          size="small"
          value={mode}
          onChange={(val) => setMode(val as PreviewMode)}
          options={[
            {
              label: (
                <span className="flex items-center gap-1">
                  <DesktopOutlined /> Desktop
                </span>
              ),
              value: 'desktop',
            },
            {
              label: (
                <span className="flex items-center gap-1">
                  <MobileOutlined /> Mobile
                </span>
              ),
              value: 'mobile',
            },
          ]}
        />
      </div>

      {/* Canvas area */}
      <div className="flex-1 flex justify-center items-start p-4 overflow-y-auto">
        <div
          className={`
            bg-white shadow-xl border border-gray-200 rounded-sm transition-all duration-300
            ${isMobile ? 'w-[375px] min-h-[812px]' : 'w-full max-w-[1024px] min-h-[800px]'}
          `}
          style={{ fontFamily }}
          onClick={() => onSelectBlock(null)}
        >
          {/* Header mockup */}
          <div
            className="text-white px-6 py-3 flex items-center justify-between text-sm"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="font-semibold">MyShop</span>
            <span className="text-xs opacity-80">Header — {fontFamily}</span>
          </div>

          {/* Body */}
          <div
            ref={setNodeRef}
            className={`p-6 transition-colors min-h-[400px] ${
              isOver
                ? 'ring-2 ring-indigo-400 ring-inset bg-indigo-50/30'
                : ''
            }`}
            style={{ backgroundColor: secondaryColor }}
          >
            {blocks.length === 0 ? (
              <EmptyCanvas />
            ) : (
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-4 ml-6">
                  {blocks.map((block) => (
                    <SortableBlockItem
                      key={block.id}
                      block={block}
                      primaryColor={primaryColor}
                      isSelected={block.id === selectedBlockId}
                      onSelect={() => onSelectBlock(block.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </div>

          {/* Footer mockup */}
          <div
            className="px-6 py-3 text-center text-xs"
            style={{ backgroundColor: '#333', color: '#999' }}
          >
            Footer — © {new Date().getFullYear()} MyShop
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewCanvas;
