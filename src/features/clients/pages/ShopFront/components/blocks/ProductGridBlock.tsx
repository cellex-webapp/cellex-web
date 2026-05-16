import React from 'react';
import { Card, Typography, Tag } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ProductGridBlockProps {
  data?: {
    title?: string;
    products?: { id: string; name: string; price: number; image?: string; saleOff?: number }[];
  };
}

const DUMMY_PRODUCTS = Array.from({ length: 8 }, (_, i) => ({
  id: `p-${i + 1}`,
  name: `Sản phẩm ${i + 1}`,
  price: 299000 + i * 75000,
  saleOff: i % 3 === 0 ? 20 : undefined,
}));

const ProductGridBlock: React.FC<ProductGridBlockProps> = ({ data }) => {
  const title = data?.title ?? 'Sản phẩm nổi bật';
  const products = data?.products?.length ? data.products : DUMMY_PRODUCTS;

  return (
    <div className="w-full py-6">
      {/* Section title */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-1 h-6 rounded-full"
          style={{ backgroundColor: 'var(--shop-primary)' }}
        />
        <Text strong className="text-lg" style={{ fontFamily: 'var(--shop-font)' }}>
          {title}
        </Text>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {products.map((product) => (
          <Card
            key={product.id}
            hoverable
            className="group overflow-hidden rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
            styles={{ body: { padding: 0 } }}
            cover={
              <div className="relative overflow-hidden bg-gray-50 aspect-square">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-300 text-4xl">
                  &#9635;
                </div>

                {product.saleOff && (
                  <Tag
                    color="red"
                    className="absolute top-2 left-2 m-0 text-xs font-semibold"
                  >
                    -{product.saleOff}%
                  </Tag>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer transition-transform hover:scale-110"
                    style={{ backgroundColor: 'var(--shop-primary)' }}
                  >
                    <ShoppingCartOutlined className="text-sm" />
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-md cursor-pointer transition-transform hover:scale-110">
                    <EyeOutlined className="text-sm" />
                  </div>
                </div>
              </div>
            }
          >
            <div className="p-3">
              <Text
                className="block text-sm font-medium truncate mb-1"
                style={{ fontFamily: 'var(--shop-font)' }}
              >
                {product.name}
              </Text>
              <Text strong style={{ color: 'var(--shop-primary)' }}>
                {product.price.toLocaleString('vi-VN')}đ
              </Text>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductGridBlock;
