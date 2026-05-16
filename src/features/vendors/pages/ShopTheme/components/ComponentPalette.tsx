import React from 'react';
import { Typography, Card, Divider } from 'antd';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  PictureOutlined,
  AppstoreOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface PaletteBlock {
  key: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}

const BLOCKS: PaletteBlock[] = [
  { key: 'banner', icon: <PictureOutlined />, label: 'Banner', description: 'Ảnh bìa / hero' },
  { key: 'grid', icon: <AppstoreOutlined />, label: 'Lưới sản phẩm', description: 'Danh sách sản phẩm' },
  { key: 'video', icon: <PlayCircleOutlined />, label: 'Video', description: 'Nhúng video nổi bật' },
  { key: 'text', icon: <FileTextOutlined />, label: 'Văn bản', description: 'Đoạn giới thiệu shop' },
  { key: 'list', icon: <UnorderedListOutlined />, label: 'Danh sách', description: 'Bộ sưu tập nổi bật' },
  { key: 'cta', icon: <ShoppingCartOutlined />, label: 'Nút kêu gọi', description: 'Liên kết nhanh' },
];

const PaletteCard: React.FC<{ block: PaletteBlock }> = ({ block }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${block.key}`,
    data: { palette: true, type: block.key, label: block.label },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card
        size="small"
        hoverable
        className="cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md hover:border-indigo-400 select-none"
        styles={{ body: { padding: '10px 12px' } }}
      >
        <div className="flex items-center gap-3">
          <span className="text-indigo-500 text-lg flex-shrink-0">
            {block.icon}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{block.label}</div>
            <Text type="secondary" className="text-xs">{block.description}</Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ComponentPalette: React.FC = () => {
  return (
    <div className="w-[280px] h-full bg-white border-r border-gray-200 p-4 overflow-y-auto shrink-0">
      <Title level={5} className="!mb-3">
        Thành phần UI
      </Title>
      <Text type="secondary" className="text-xs block mb-3">
        Kéo thả để thêm vào giao diện
      </Text>
      <Divider className="!my-2" />
      <div className="flex flex-col gap-2">
        {BLOCKS.map((block) => (
          <PaletteCard key={block.key} block={block} />
        ))}
      </div>
    </div>
  );
};

export default ComponentPalette;
