import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button, Spin, Tag, message, InputNumber } from 'antd';
import { unwrapResult } from '@reduxjs/toolkit';
import { ShoppingCartOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import orderService from '@/services/order.service';
import { useProduct } from '@/hooks/useProduct';
import { useAttribute } from '@/hooks/useAttribute';
import ShopCard from '@/features/clients/components/Shop/ShopCard';
import { useCart } from '@/hooks/useCart';
import CouponList from '@/features/clients/components/Coupon/CouponList';
import { ProductReviews } from '@/features/clients/components/Review';
import RecommendedProducts from '@/features/clients/components/Product/RecommendedProducts';

const formatCurrency = (v?: number) => {
    if (v == null) return '';
    return v.toLocaleString('vi-VN') + ' đ';
};

const normalizeText = (value?: string) => (value || '').trim().toLowerCase();

const getSkuVariationValue = (sku: IProductSku, optionName: string) => {
    const entries = Object.entries(sku.variationData || {});
    const matched = entries.find(([key]) => normalizeText(key) === normalizeText(optionName));
    return matched?.[1];
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
    const [searchParams] = useSearchParams();
    
    // Check for order ID from query params (for review creation)
    const orderIdForReview = searchParams.get('orderId');
    const showReviewForm = searchParams.get('review') === 'true';

    const { selectedProduct, isLoading, fetchProductById } = useProduct();
    const { addToCart, isLoading: cartLoading } = useCart();
    const [imgIndex, setImgIndex] = useState(0);
    const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
    
    // Get current user from localStorage (would be better from Redux in real app)
    const currentUser = useMemo(() => {
        const userInfo = localStorage.getItem('userInfo');
        const role = localStorage.getItem('role') as UserRole;
        if (userInfo) {
            try {
                const user = JSON.parse(userInfo);
                return { id: user.id, role, shopId: user.shopId };
            } catch {
                return undefined;
            }
        }
        return undefined;
    }, []);

    useEffect(() => {
        if (id) fetchProductById(id);
    }, [id, fetchProductById]);

    const p = selectedProduct as IProduct | undefined;
    const images = p?.images && p.images.length > 0 ? p.images : [];
    const variationOptions = p?.variationOptions ?? [];
    const hasVariantSkus = (p?.skus?.length ?? 0) > 0;
    const requiresVariationSelection = hasVariantSkus && variationOptions.length > 0;

    const salePercent = p && p.price ? Math.round(((p.price - (p.finalPrice ?? p.price)) / (p.price || 1)) * 100) : 0;

    const attributeGroups = p?.attributeValues?.reduce((acc, av) => {
        const groupName = av.attributeName || 'Thuộc tính';
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(av);
        return acc;
    }, {} as Record<string, typeof p.attributeValues>);

    const { getHighlightAttributes } = useAttribute();

    useEffect(() => {
        if (p?.categoryId) {
            getHighlightAttributes(p.categoryId);
        }
    }, [p?.categoryId, getHighlightAttributes]);

    useEffect(() => {
        if (!p || variationOptions.length === 0) {
            setSelectedVariations({});
            return;
        }

        const defaults: Record<string, string> = {};
        variationOptions.forEach((option) => {
            if (option.values?.length) {
                defaults[option.name] = option.values[0];
            }
        });
        setSelectedVariations(defaults);
    }, [p?.id, variationOptions]);

    const selectedSku = useMemo(() => {
        if (!p?.skus || p.skus.length === 0) return undefined;
        if (variationOptions.length === 0) return p.skus[0];

        const allSelected = variationOptions.every((option) => !!selectedVariations[option.name]);
        if (!allSelected) return undefined;

        return p.skus.find((sku) => variationOptions.every((option) => {
            const selectedValue = selectedVariations[option.name];
            const skuValue = getSkuVariationValue(sku, option.name);
            return normalizeText(selectedValue) === normalizeText(skuValue);
        }));
    }, [p?.skus, variationOptions, selectedVariations]);

    const displayPrice = selectedSku?.price ?? p?.finalPrice ?? p?.price ?? 0;
    const displayStock = selectedSku?.availableStock ?? p?.stockQuantity ?? 0;

    const canBuy = useMemo(() => {
        if (!p) return false;
        if (requiresVariationSelection && !selectedSku) return false;
        if (displayStock <= 0) return false;
        return true;
    }, [p, requiresVariationSelection, selectedSku, displayStock]);

    const [quantity, setQuantity] = useState<number>(1);

    useEffect(() => {
        setQuantity(1);
    }, [p?.id, selectedSku?.id]);

    const handleAddToCart = async (goCheckout?: boolean) => {
        if (!p) return;
        if (requiresVariationSelection && !selectedSku) {
            message.warning('Vui lòng chọn đầy đủ biến thể sản phẩm');
            return;
        }
        if (quantity <= 0) {
            message.warning('Vui lòng chọn số lượng hợp lệ');
            return;
        }
        if (quantity > displayStock) {
            message.error(`Số lượng tồn kho chỉ còn ${displayStock} sản phẩm.`);
            setQuantity(displayStock);
            return;
        }
        try {
            if (goCheckout) {
                // Direct create order from product flow
                const requestBody: CreateOrderRequest = {
                    items: [
                        {
                            productId: p.id,
                            skuId: selectedSku?.id,
                            quantity: quantity
                        }
                    ]
                };
                const resp = await orderService.createOrderFromProduct(requestBody);
                const order = resp.result as IOrder;
                if (order?.id) {
                    message.success('Tạo đơn hàng thành công');
                    window.location.href = `/order/confirm/${order.id}`;
                } else {
                    message.error('Không tạo được đơn hàng');
                }
            } else {
                const action = await addToCart({ productId: p.id, skuId: selectedSku?.id, quantity });
                unwrapResult(action as any);
                message.success('Đã thêm vào giỏ hàng');
            }
        } catch (e: any) {
            message.error(e?.message || 'Không thể xử lý yêu cầu');
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
                                {selectedSku?.imageUrl ? (
                                    <img
                                        src={selectedSku.imageUrl}
                                        alt={p.name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : images.length > 0 ? (
                                    <img
                                        src={images[imgIndex]}
                                        alt={p.name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <PlaceholderImage />
                                )}
                            </div>

                            {!selectedSku?.imageUrl && images.length > 1 && (
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

                            {!selectedSku?.imageUrl && images.length > 1 && (
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
                            
                            {selectedSku?.imageUrl && (
                                <div className="absolute bottom-4 right-4 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                                    Ảnh biến thể
                                </div>
                            )}
                        </div>
                    </div>


                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">{p.name}</h1>

                        {variationOptions.length > 0 && (
                            <div className="mb-5">
                                {variationOptions.map((option) => (
                                    <div key={option.name} className="mb-4 last:mb-0">
                                        <div className="text-sm font-medium text-gray-700 mb-2">{option.name}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {(option.values || []).map((value) => {
                                                const isSelected = selectedVariations[option.name] === value;
                                                return (
                                                    <button
                                                        key={`${option.name}-${value}`}
                                                        onClick={() => setSelectedVariations((prev) => ({
                                                            ...prev,
                                                            [option.name]: value,
                                                        }))}
                                                        className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${isSelected
                                                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                                                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                                            }`}
                                                    >
                                                        {value}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                                {requiresVariationSelection && !selectedSku && (
                                    <div className="text-sm text-orange-600 mt-2">Vui lòng chọn đúng tổ hợp biến thể khả dụng.</div>
                                )}
                                {selectedSku && (
                                    <div className="text-sm text-gray-600 mt-2">SKU: {selectedSku.skuCode}</div>
                                )}
                            </div>
                        )}

                        {attributeGroups && Object.entries(attributeGroups).map(([groupName, values]) => (
                            <div key={groupName} className="mb-4">
                                <div className="text-sm font-medium text-gray-700 mb-2">{groupName}</div>
                                <div className="flex flex-wrap gap-2">
                                    {values.map((av) => {
                                        return (
                                            <Tag
                                                key={av.attributeId}
                                                color="default"
                                                className="!m-0"
                                            >
                                                {av.value} {av.unit ? `${av.unit}` : ''}
                                            </Tag>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        <div className="mb-6">
                            <div className="flex items-end gap-3 mb-2">
                                <div className="text-3xl font-bold text-red-600">
                                    {formatCurrency(displayPrice)}
                                </div>
                                {!selectedSku && p.saleOff !== 0 && (
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
                            <div className="text-sm text-gray-600 mt-2">Tồn kho khả dụng: {displayStock}</div>
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
                                    max={Math.max(1, displayStock)}
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

            {/* Product Reviews Section */}
            <div className="mt-4">
                <ProductReviews
                    productId={id!}
                    productName={p.name}
                    productImage={p.images?.[0]}
                    shopId={p.shopId}
                    currentUser={currentUser}
                    orderIdForReview={orderIdForReview || undefined}
                    showReviewForm={showReviewForm}
                />
            </div>

            {/* Recommended Products Section */}
            <div className="mt-4">
                <RecommendedProducts
                    currentProductId={p.id}
                    shopId={p.shopId}
                />
            </div>
        </div>
    );
};

export default ProductDetailCard;