import React, { useEffect, useState } from 'react';
import { Card, Rate, Skeleton, Tag } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/utils/axiosInstance';

interface AIProductCardProps {
  productId: string;
}

interface ProductInfo {
  id: string;
  name: string;
  price: number;
  finalPrice: number;
  saleOff?: number;
  images?: string[];
  averageRating: number;
  reviewCount: number;
  stockQuantity: number;
  keyAttributes?: Array<{
    key: string;
    name: string;
    value: string;
    unit: string;
  }>;
}

const AIProductCard: React.FC<AIProductCardProps> = ({ productId }) => {
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`/products/${productId}`);
        const productData = response.data.result;
        
        // Extract key attributes from attributeValues
        if (productData.attributeValues) {
          const keyAttrKeys = ['ram', 'battery', 'screen', 'storage', 'cpu', 'vga'];
          const keyAttributes = productData.attributeValues
            .filter((attr: any) => keyAttrKeys.includes(attr.attributeKey))
            .map((attr: any) => ({
              key: attr.attributeKey,
              name: attr.attributeName,
              value: attr.value,
              unit: attr.unit || '',
            }));
          productData.keyAttributes = keyAttributes;
        }
        
        setProduct(productData);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <Card size="small" className="cursor-pointer hover:shadow-md transition-shadow">
        <Skeleton active avatar paragraph={{ rows: 2 }} />
      </Card>
    );
  }

  if (!product) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleClick = () => {
    navigate(`/products/${productId}`);
  };

  return (
    <Card
      size="small"
      hoverable
      onClick={handleClick}
      className="cursor-pointer hover:shadow-md transition-all hover:border-blue-300"
      cover={
        product.images && product.images.length > 0 ? (
          <div className="h-24 overflow-hidden bg-gray-100">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="h-24 bg-gray-100 flex items-center justify-center">
            <ShoppingCartOutlined className="text-3xl text-gray-300" />
          </div>
        )
      }
    >
      <div className="space-y-1">
        <p className="font-medium text-gray-800 text-sm line-clamp-2 leading-tight min-h-[2.5rem]">
          {product.name}
        </p>
        
        {/* Display key attributes if available */}
        {product.keyAttributes && product.keyAttributes.length > 0 && (
          <div className="flex flex-wrap gap-1 py-1">
            {product.keyAttributes.map((attr, idx) => (
              <Tag key={idx} color="blue" className="text-xs m-0">
                {attr.name}: {attr.value}{attr.unit}
              </Tag>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <Rate disabled defaultValue={product.averageRating} className="text-xs" />
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-red-600 font-bold text-sm">
            {formatPrice(product.finalPrice)}
          </span>
          {product.saleOff && product.saleOff > 0 && (
            <>
              <span className="text-gray-400 text-xs line-through">
                {formatPrice(product.price)}
              </span>
              <Tag color="red" className="text-xs">
                -{product.saleOff}%
              </Tag>
            </>
          )}
        </div>
        
        {product.stockQuantity <= 10 && product.stockQuantity > 0 && (
          <Tag color="orange" className="text-xs">
            Còn {product.stockQuantity} sản phẩm
          </Tag>
        )}
        {product.stockQuantity === 0 && (
          <Tag color="red" className="text-xs">Hết hàng</Tag>
        )}
      </div>
    </Card>
  );
};

export default AIProductCard;
