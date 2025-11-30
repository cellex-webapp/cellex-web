import React, { useEffect, useState } from 'react';
import { Modal, Descriptions, Image, Spin, Tag } from 'antd';
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
        <Modal open={open} onCancel={onClose} footer={null} title="Chi tiết sản phẩm" width={900} centered>
            {loading ? (
                <Spin />
            ) : (
                product && (
                    <div>
                        <div className="flex gap-4 mb-3">
                            {product.images?.[0] && <Image src={product.images?.[0]} width={200} />}
                            <div className="flex-1">
                                <div className="text-lg font-semibold mb-1">{product.name}</div>
                                <div className="text-gray-600 mb-2">{product.description || '—'}</div>
                                <div className="flex items-center gap-2">
                                    <Tag color="blue">{product.categoryInfo?.name || 'Danh mục'}</Tag>
                                    <Tag>{product.shopInfo?.shop_name || 'Cửa hàng'}</Tag>
                                    <Tag color={product.isPublished ? 'success' : 'default'}>{product.isPublished ? 'Xuất bản' : 'Nháp'}</Tag>
                                </div>
                            </div>
                        </div>
                        <Descriptions column={3} bordered size="small">
                            <Descriptions.Item label="Giá gốc">{product.price?.toLocaleString()}</Descriptions.Item>
                            <Descriptions.Item label="Giảm giá">{product.saleOff ?? 0}%</Descriptions.Item>
                            <Descriptions.Item label="Giá cuối">{product.finalPrice?.toLocaleString()}</Descriptions.Item>
                            <Descriptions.Item label="Tồn kho">{product.stockQuantity}</Descriptions.Item>
                            <Descriptions.Item label="Đánh giá TB">{(product.averageRating ?? 0).toFixed(2)}</Descriptions.Item>
                            <Descriptions.Item label="Lượt đánh giá">{product.reviewCount}</Descriptions.Item>
                            <Descriptions.Item label="Đã bán">{product.purchaseCount}</Descriptions.Item>
                            <Descriptions.Item label="Tạo lúc">{product.createdAt ? new Date(product.createdAt).toLocaleString() : '—'}</Descriptions.Item>
                            <Descriptions.Item label="Cập nhật">{product.updatedAt ? new Date(product.updatedAt).toLocaleString() : '—'}</Descriptions.Item>
                        </Descriptions>

                        {product.attributeValues && product.attributeValues.length > 0 && (
                            <div className="mt-3">
                                <div className="font-medium mb-2">Thuộc tính</div>
                                <Descriptions column={3} size="small" bordered>
                                    {product.attributeValues.map((av, idx) => (
                                        <Descriptions.Item key={idx} label={av.attributeName || av.attributeKey}>
                                            {av.value}{av.unit ? ` ${av.unit}` : ''}
                                        </Descriptions.Item>
                                    ))}
                                </Descriptions>
                            </div>
                        )}
                    </div>
                )
            )}
        </Modal>
    );
};

export default ProductDetailModal;
