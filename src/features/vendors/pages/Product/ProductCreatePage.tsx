import React from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import ProductFormModal from './ProductFormModal';
import { productService } from '@/services/product.service';

const ProductCreatePage: React.FC = () => {
    const navigate = useNavigate();

    const handleSubmit = async (payload: any) => {
        try {
            await productService.createProduct(payload);
            message.success('Tạo sản phẩm thành công');
            navigate('/vendor/products');
        } catch (err: any) {
            message.error(err?.message || 'Không thể tạo sản phẩm');
        }
    };

    return (
        <div className="p-4 flex justify-center">
            <div style={{ width: '100%', maxWidth: 900 }}>
                <h1 className="mb-4 text-xl font-semibold">Tạo sản phẩm</h1>
                <ProductFormModal open={true} onClose={() => navigate('/vendor/products')} onSubmit={handleSubmit} />
            </div>
        </div>
    );
};

export default ProductCreatePage;
