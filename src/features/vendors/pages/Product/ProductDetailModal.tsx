import React, { useEffect, useState } from 'react';
import { Modal, Descriptions, Image, Spin } from 'antd';
import { productService } from '@/services/product.service';

interface Props {
    productId: string | null;
    open: boolean;
    onClose: () => void;
}

const ProductDetailModal: React.FC<Props> = ({ productId, open, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState<IProduct | null>(null);

    useEffect(() => {
        const fetch = async () => {
            if (!productId) return;
            setLoading(true);
            try {
                const resp = await productService.getProductById(productId);
                setProduct(resp.result);
            } catch (e) {
                // ignore
            } finally {
                setLoading(false);
            }
        };
        if (open) fetch();
    }, [productId, open]);

    return (
        <Modal open={open} onCancel={onClose} footer={null} title="Chi tiết sản phẩm">
            {loading ? (
                <Spin />
            ) : (
                product && (
                    <div>
                        <Image src={product.images?.[0]} width={240} />
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="Tên">{product.name}</Descriptions.Item>
                            <Descriptions.Item label="Mô tả">{product.description}</Descriptions.Item>
                            <Descriptions.Item label="Giá">{product.price?.toLocaleString()}</Descriptions.Item>
                            <Descriptions.Item label="Giảm giá">{product.saleOff}%</Descriptions.Item>
                            <Descriptions.Item label="Tồn kho">{product.stockQuantity}</Descriptions.Item>
                        </Descriptions>
                    </div>
                )
            )}
        </Modal>
    );
};

export default ProductDetailModal;
