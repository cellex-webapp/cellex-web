import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Spin, Empty, Typography, Tag, Rate, Alert } from 'antd';
import { CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useProduct } from '@/hooks/useProduct';

const { Title, Text } = Typography;

const CompareProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { compareProducts, comparisonData, isComparing, error } = useProduct();

  // Lấy danh sách ID từ URL
  const idsParam = searchParams.get('ids');
  const productIds = idsParam ? idsParam.split(',').filter(Boolean) : [];

  useEffect(() => {
    if (productIds.length >= 2) {
      compareProducts(productIds);
    }
  }, [idsParam]);

  if (productIds.length < 2) {
    return (
      <div className="container mx-auto py-10">
        <Empty description="Vui lòng chọn ít nhất 2 sản phẩm để so sánh" />
      </div>
    );
  }

  if (isComparing) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang phân tích và so sánh..." />
      </div>
    );
  }

  if (error || !comparisonData) {
    return (
      <div className="container mx-auto py-10">
        <Alert message="Lỗi so sánh" description={error || 'Không tải được dữ liệu'} type="error" showIcon />
      </div>
    );
  }

  const { products, technicalSpecs, priceSummary } = comparisonData;

  return (
    <div className="container mx-auto py-8 bg-white rounded-lg shadow-sm px-6">
      <Title level={2} className="mb-6">So sánh cấu hình chi tiết</Title>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            {/* Hàng Tiêu đề Sản phẩm */}
            <tr>
              <th className="w-1/5 border border-gray-200 bg-gray-50 p-4 text-left font-semibold">
                Sản phẩm
              </th>
              {products.map((product) => (
                <th key={product.id} className="border border-gray-200 p-4 align-top w-[250px] min-w-[200px]">
                  <div className="flex flex-col items-center text-center">
                    <img src={product.image} alt={product.name} className="w-32 h-32 object-contain mb-3" />
                    <Link to={`/products/${product.id}`} className="text-blue-600 font-medium hover:underline line-clamp-2 h-10 mb-2">
                      {product.name}
                    </Link>
                    
                    {/* Xử lý giá */}
                    <div className="mb-1">
                      <Text className="text-red-500 font-bold text-lg">
                        {product.finalPrice?.toLocaleString('vi-VN')} ₫
                      </Text>
                    </div>
                    {product.saleOff > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Text delete className="text-gray-400">
                          {product.price?.toLocaleString('vi-VN')} ₫
                        </Text>
                        <Tag color="error">-{product.saleOff}%</Tag>
                      </div>
                    )}
                    
                    <div className="mt-2 flex items-center gap-1">
                      <Rate disabled defaultValue={product.averageRating} allowHalf className="text-sm" />
                    </div>

                    {/* Badge Best Price / Best Savings */}
                    <div className="mt-3 flex flex-col gap-1">
                      {priceSummary.lowestPriceProductId === product.id && (
                        <Tag color="green" className="!text-center !flex !items-center !justify-center">Giá tốt nhất</Tag>
                      )}
                      {priceSummary.highestSavingsProductId === product.id && priceSummary.highestSavingsAmount > 0 && (
                        <Tag color="volcano" className="!text-center !flex !items-center !justify-center">Tiết kiệm nhất</Tag>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {/* Render các hàng Thông số kỹ thuật */}
            {technicalSpecs.map((spec, index) => (
              <tr key={index} className={`hover:bg-gray-50 ${spec.isDifferent ? 'bg-blue-50/30' : ''}`}>
                <td className="border border-gray-200 p-4 font-medium text-gray-700 flex items-center justify-between">
                  <span>{spec.attributeName}</span>
                  {spec.isHighlight && <Tag color="blue" className="mr-0 border-0">Nổi bật</Tag>}
                </td>
                
                {products.map((product) => {
                  const value = spec.values[product.id];
                  const isBest = spec.bestProductId === product.id;
                  
                  return (
                    <td key={`${spec.attributeName}-${product.id}`} className="border border-gray-200 p-4 text-center">
                      <div className={`flex flex-col items-center justify-center ${isBest ? 'text-green-600 font-bold' : 'text-gray-600'}`}>
                        <span>{value}</span>
                        {isBest && (
                          <span className="text-xs flex items-center gap-1 mt-1 bg-green-100 px-2 py-0.5 rounded-full">
                            <CheckCircleOutlined /> Vượt trội
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
        <InfoCircleOutlined />
        <span>Các dòng có nền xanh nhạt biểu thị sự khác biệt giữa các sản phẩm.</span>
      </div>
    </div>
  );
};

export default CompareProductsPage;