import React from 'react';
import HeroBannerBlock from './blocks/HeroBannerBlock';
import ProductGridBlock from './blocks/ProductGridBlock';

interface DynamicRendererProps {
  blocks: ILayoutSection[];
}

const DynamicRenderer: React.FC<DynamicRendererProps> = ({ blocks }) => {
  if (!blocks?.length) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-5xl mb-3">&#9635;</div>
        <p>Cửa hàng đang được thiết lập</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {blocks.map((block: ILayoutSection) => {
        const childProps = {
          data: { ...block },
        };

        switch (block.type) {
          case 'banner':
            return <HeroBannerBlock key={block.id} {...childProps} />;

          case 'grid':
            return <ProductGridBlock key={block.id} {...childProps} />;

          default:
            return null;
        }
      })}
    </div>
  );
};

export default DynamicRenderer;
