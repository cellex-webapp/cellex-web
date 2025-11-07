import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Spin, Tag, message, InputNumber } from 'antd';
import { unwrapResult } from '@reduxjs/toolkit';
import { ShoppingCartOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useProduct } from '@/hooks/useProduct';
import { useAttribute } from '@/hooks/useAttribute';
import ShopCard from '@/features/clients/components/Shop/ShopCard';
import { useCart } from '@/hooks/useCart';
import CouponList from '@/features/clients/components/Coupon/CouponList';

const formatCurrency = (v?: number) => {
    if (v == null) return '';
    return v.toLocaleString('vi-VN') + ' đ';
};

const PlaceholderImage: React.FC = () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
        <div className="text-center">
            <div className="text-4xl mb-2">📦</div>
            <div className="text-sm">Chưa có hình ảnh</div>
        </div>
    </div>
);

const ProductDetailCard: React.FC = () => {
    const { id } = useParams();

    const { selectedProduct, isLoading, fetchProductById } = useProduct();
    const { addToCart, isLoading: cartLoading } = useCart();
    const [imgIndex, setImgIndex] = useState(0);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

    useEffect(() => {
        if (id) fetchProductById(id);
    }, [id, fetchProductById]);

    const p = selectedProduct as IProduct | undefined;
    const images = p?.images && p.images.length > 0 ? p.images : [];

    const salePercent = p && p.price ? Math.round(((p.price - (p.finalPrice ?? p.price)) / (p.price || 1)) * 100) : 0;

    const attributeGroups = p?.attributeValues?.reduce((acc, av) => {
        const groupName = av.attributeName || 'Thuộc tính';
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(av);
        return acc;
    }, {} as Record<string, typeof p.attributeValues>);

    const { fetchHighlightAttributesOfCategory } = useAttribute();

    useEffect(() => {
        if (p?.categoryId) {
            fetchHighlightAttributesOfCategory(p.categoryId);
        }
    }, [p?.categoryId, fetchHighlightAttributesOfCategory]);

    const canBuy = useMemo(() => {
        if (!p) return false;
        if (p.stockQuantity <= 0) return false;
        return true;
    }, [p]);

    const [quantity, setQuantity] = useState<number>(1);

    useEffect(() => {
        setQuantity(1);
    }, [p?.id]);

    const handleAddToCart = async (goCheckout?: boolean) => {
        if (!p) return;
        if (quantity <= 0) {
            message.warning('Vui lòng chọn số lượng hợp lệ');
            return;
        }
        if (quantity > p.stockQuantity) {
            message.error(`Số lượng tồn kho chỉ còn ${p.stockQuantity} sản phẩm.`);
            setQuantity(p.stockQuantity);
            return;
        }
        try {
            const action = await addToCart({ productId: p.id, quantity });
            unwrapResult(action as any);
            message.success('Đã thêm vào giỏ hàng');
            if (goCheckout) {
                window.location.href = '/checkout';
            }
        } catch (e: any) {
            message.error(e?.message || 'Không thể thêm vào giỏ hàng');
        }
    };

    if (isLoading || !p) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="bg-white rounded-lg mb-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                    <div>
                        <div className="relative bg-white rounded-lg overflow-hidden mb-4">
                            <div className="w-full aspect-square flex items-center justify-center bg-white">
                                {images.length > 0 ? (
                                    <img
                                        src={images[imgIndex]}
                                        alt={p.name}
                                        className="w-full h-full"
                                    />
                                ) : (
                                    <PlaceholderImage />
                                )}
                            </div>

                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white transition-colors"
                                        aria-label="Prev"
                                    >
                                        <LeftOutlined />
                                    </button>
                                    <button
                                        onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white transition-colors"
                                        aria-label="Next"
                                    >
                                        <RightOutlined />
                                    </button>
                                </>
                            )}

                            {images.length > 1 && (
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex items-center gap-2">
                                    {images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setImgIndex(i)}
                                            className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? 'bg-blue-600 w-6' : 'bg-gray-300'
                                                }`}
                                            aria-label={`Go to image ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">{p.name}</h1>

                        {attributeGroups && Object.entries(attributeGroups).map(([groupName, values]) => (
                            <div key={groupName} className="mb-4">
                                <div className="text-sm font-medium text-gray-700 mb-2">{groupName}</div>
                                <div className="flex flex-wrap gap-2">
                                    {values.map((av) => {
                                        const isSelected = selectedAttributes[groupName] === av.value;
                                        return (
                                            <button
                                                key={av.attributeId}
                                                onClick={() => setSelectedAttributes(prev => ({
                                                    ...prev,
                                                    [groupName]: av.value
                                                }))}
                                                className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${isSelected
                                                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                                    }`}
                                            >
                                                {av.value} {av.unit ? `${av.unit}` : ''}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        <div className="mb-6">
                            <div className="flex items-end gap-3 mb-2">
                                <div className="text-3xl font-bold text-red-600">
                                    {formatCurrency(p.finalPrice)}
                                </div>
                                {p.saleOff !== 0 && (
                                    <>
                                        <div className="text-lg text-gray-400 line-through mb-1">
                                            {formatCurrency(p.price)}
                                        </div>
                                        <div className="text-red-600 font-medium mb-1">
                                            {salePercent}%
                                        </div>
                                    </>
                                )}
                            </div>
                            <Tag color="orange" className="text-xs">
                                + 5.000 Điểm thưởng
                            </Tag>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                className="w-12 h-12 rounded-lg border-2 border-blue-600 flex items-center justify-center hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-60"
                                disabled={!canBuy || cartLoading}
                                onClick={() => handleAddToCart(false)}
                                aria-label="Thêm vào giỏ"
                            >
                                <ShoppingCartOutlined className="text-xl text-blue-600" />
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Số lượng</span>
                                <InputNumber
                                    min={1}
                                    max={p.stockQuantity}
                                    value={quantity}
                                    onChange={(v) => setQuantity(Number(v) || 1)}
                                    style={{ width: 90 }}
                                    disabled={!canBuy || cartLoading}
                                />
                            </div>
                            <Button
                                type="primary"
                                size="large"
                                className="flex-1 h-12 !bg-indigo-600 hover:!bg-indigo-700 font-medium text-base"
                                disabled={!canBuy || cartLoading}
                                loading={cartLoading}
                                onClick={() => handleAddToCart(true)}
                            >
                                Mua ngay
                            </Button>
                        </div>
                        <div className="mt-6">
                            <CouponList />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Thông số nổi bật</h2>
                    <Button type="link" className="!bg-indigo-500 !text-white hover:!bg-indigo-600 cursor-pointer">
                        Xem tất cả thông số
                    </Button>
                </div>

                <div className="space-y-4">
                    <div>
                        <ShopCard
                            shopId={p.shopInfo?.id ?? (p.shopId as any) ?? undefined}
                            reviewCount={p.reviewCount ?? 0}
                            purchaseCount={p.purchaseCount ?? '-'}
                            joinDate={(p.shopInfo as any)?.created_at ?? undefined}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailCard;