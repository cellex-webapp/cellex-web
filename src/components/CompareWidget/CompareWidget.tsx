import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tooltip, message } from 'antd';
import { CloseCircleOutlined, SwapOutlined } from '@ant-design/icons';
import { useProduct } from '@/hooks/useProduct';

const CompareWidget: React.FC = () => {
  const navigate = useNavigate();
  const { compareList, removeFromCompareList, clearCompareList } = useProduct();

  const handleCompare = () => {
    if (compareList.length < 2) {
      message.warning('Vui lòng chọn ít nhất 2 sản phẩm để so sánh!');
      return;
    }

    // Lấy mảng ID và chuyển thành param url
    const ids = compareList.map(p => p.id).join(',');
    navigate(`/compare?ids=${ids}`);
  };

  // Render các slot trống nếu chưa chọn đủ 4 sản phẩm
  const slots = [...compareList, ...Array(Math.max(0, 4 - compareList.length)).fill(null)];

  if (compareList.length === 0) {
    return (
      <div className="fixed bottom-4 right-4 z-[70]">
        <Button
          type="default"
          size="large"
          icon={<SwapOutlined />}
          onClick={handleCompare}
          className="h-auto rounded-full border border-gray-200 bg-white px-4 py-3 shadow-lg hover:border-blue-500 hover:text-blue-600"
        >
          So sánh sản phẩm (0/4)
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)] border-t border-gray-200 z-[70] p-3 transform transition-transform duration-300">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Tiêu đề & Nút Xóa tất cả */}
        <div className="flex flex-col items-start min-w-[150px]">
          <span className="font-semibold text-gray-800">So sánh sản phẩm</span>
          <span className="text-xs text-gray-500">({compareList.length}/4 sản phẩm)</span>
          <Button 
            type="link" 
            danger 
            size="small" 
            className="p-0 text-xs mt-1"
            onClick={clearCompareList}
          >
            Xóa tất cả
          </Button>
        </div>

        {/* Danh sách các slot sản phẩm */}
        <div className="flex items-center gap-3 overflow-x-auto flex-1 justify-center md:justify-start">
          {slots.map((product, index) => (
            <div 
              key={product?.id || `empty-${index}`} 
              className="relative w-16 h-16 md:w-20 md:h-20 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center flex-shrink-0"
            >
              {product ? (
                <>
                  <Tooltip title={product.name}>
                    <img 
                      src={product.images?.[0] || ''} 
                      alt={product.name} 
                      className="w-full h-full object-contain p-1"
                    />
                  </Tooltip>
                  <div 
                    className="absolute top-0 right-0 bg-white rounded-full cursor-pointer shadow-sm hover:scale-110 transition-transform"
                    onClick={() => removeFromCompareList(product.id)}
                  >
                    <CloseCircleOutlined className="text-red-500 text-base" />
                  </div>
                </>
              ) : (
                <span className="text-3xl text-gray-200 font-light">+</span>
              )}
            </div>
          ))}
        </div>

        {/* Nút Thực hiện So sánh */}
        <div className="flex-shrink-0">
          <Button 
            type="primary" 
            size="large" 
            icon={<SwapOutlined />}
            onClick={handleCompare}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={compareList.length < 2}
          >
            So sánh ngay
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompareWidget;