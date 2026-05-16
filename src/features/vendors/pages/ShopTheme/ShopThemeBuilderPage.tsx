import React, { useEffect, useCallback, useState } from 'react';
import { App } from 'antd';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import useShop from '@/hooks/useShop';
import useShopTheme from '@/hooks/useShopTheme';
import ComponentPalette from './components/ComponentPalette';
import PreviewCanvas from './components/PreviewCanvas';
import GlobalSettings from './components/GlobalSettings';
import BlockSettings from './components/BlockSettings';

export interface CanvasBlock {
  id: string;
  type: string;
  label: string;
  data?: Record<string, any>;
}

const arrayMove = <T,>(arr: T[], from: number, to: number): T[] => {
  const result = [...arr];
  const [removed] = result.splice(from, 1);
  result.splice(to, 0, removed);
  return result;
};

const ShopThemeBuilderPageContent: React.FC = () => {
  const { message } = App.useApp();
  const { shop, isLoading: isShopLoading, fetchMyShop } = useShop();
  const {
    theme, isLoading: isThemeLoading,
    fetchTheme, createTheme, updateTheme, deleteTheme,
    error,
  } = useShopTheme();

  const shopId = shop?.id;
  const isLoading = isShopLoading || isThemeLoading;

  const [blocks, setBlocks] = useState<CanvasBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    fetchMyShop();
  }, [fetchMyShop]);

  useEffect(() => {
    if (shopId) {
      fetchTheme(shopId);
    }
  }, [shopId, fetchTheme]);

  // Seed blocks from saved theme layoutConfig
  useEffect(() => {
    if (theme?.layoutConfig?.sections?.length) {
      setBlocks(
        theme.layoutConfig.sections.map((s: ILayoutSection): CanvasBlock => ({
          id: s.id,
          type: s.type,
          label: s.label ?? s.type,
          data: (s as any).data ?? {},
        }))
      );
    } else {
      setBlocks([]);
    }
  }, [theme?.id]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error, message]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      if (active.data.current?.palette) {
        const newBlock: CanvasBlock = {
          id: `${active.data.current.type}-${Date.now()}`,
          type: active.data.current.type as string,
          label: active.data.current.label as string,
          data: {},
        };

        if (over.id === 'canvas-drop-zone') {
          setBlocks((prev) => [...prev, newBlock]);
        } else {
          const idx = blocks.findIndex((b) => b.id === over.id);
          if (idx !== -1) {
            setBlocks((prev) => {
              const next = [...prev];
              next.splice(idx, 0, newBlock);
              return next;
            });
          } else {
            setBlocks((prev) => [...prev, newBlock]);
          }
        }

        // Auto-select newly dropped block
        setSelectedBlockId(newBlock.id);
        return;
      }

      // Canvas block reorder
      const oldIdx = blocks.findIndex((b) => b.id === active.id);
      const newIdx = blocks.findIndex((b) => b.id === over.id);
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        setBlocks(arrayMove(blocks, oldIdx, newIdx));
      }
    },
    [blocks]
  );

  const handleUpdateBlockData = useCallback(
    (blockId: string, data: Record<string, any>) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, data } : b))
      );
    },
    []
  );

  const handleSave = useCallback(
    async (payload: ICreateThemePayload) => {
      if (!shopId) return;
      const fullPayload: ICreateThemePayload = {
        ...payload,
        layoutConfig: { sections: blocks },
      };
      if (theme) {
        await updateTheme(shopId, fullPayload).unwrap();
        message.success('Cập nhật giao diện thành công');
      } else {
        await createTheme(shopId, fullPayload).unwrap();
        message.success('Tạo giao diện thành công');
      }
    },
    [shopId, theme, blocks, createTheme, updateTheme, message]
  );

  const handleDelete = useCallback(async () => {
    if (!shopId) return;
    await deleteTheme(shopId).unwrap();
    setBlocks([]);
    setSelectedBlockId(null);
    message.success('Đã xoá giao diện, shop sẽ dùng giao diện mặc định');
  }, [shopId, deleteTheme, message]);

  if (!shop) {
    return null;
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="h-[calc(100vh-64px)] w-full flex overflow-hidden bg-slate-50">
        <ComponentPalette />
        <PreviewCanvas
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          onSelectBlock={setSelectedBlockId}
          primaryColor={theme?.primaryColor}
          secondaryColor={theme?.secondaryColor}
          fontFamily={theme?.fontFamily}
        />
        {selectedBlock ? (
          <BlockSettings
            block={selectedBlock}
            onUpdateBlockData={handleUpdateBlockData}
            onBack={() => setSelectedBlockId(null)}
          />
        ) : (
          <GlobalSettings
            theme={theme}
            isLoading={isLoading}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        )}
      </div>
    </DndContext>
  );
};

const ShopThemeBuilderPage: React.FC = () => (
  <App>
    <ShopThemeBuilderPageContent />
  </App>
);

export default ShopThemeBuilderPage;
