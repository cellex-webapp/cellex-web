import React, { useEffect, useState } from 'react';
import { Typography, Spin } from 'antd';
import { productService } from '@/services/product.service';
import ProductCard from '@/features/clients/components/Product/ProductCard';

const { Text } = Typography;

interface ProductGridBlockProps {
  data?: {
    title?: string;
    displayCount?: number;
  };
  shopId: string;
}

const ProductGridBlock: React.FC<ProductGridBlockProps> = ({ data, shopId }) => {
  const title = data?.title ?? 'Sản phẩm nổi bật';
  const displayCount = data?.displayCount ?? 4;

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    productService
      .getProductsByShop(shopId, { page: 1, limit: displayCount })
      .then((resp) => setProducts(resp.result?.content ?? []))
      .finally(() => setLoading(false));
  }, [shopId, displayCount]);

  return (
    <div className="w-full py-6">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-1 h-6 rounded-full"
          style={{ backgroundColor: 'var(--shop-primary)' }}
        />
        <Text strong className="text-lg" style={{ fontFamily: 'var(--shop-font)' }}>
          {title}
        </Text>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          Chưa có sản phẩm nào
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGridBlock;
