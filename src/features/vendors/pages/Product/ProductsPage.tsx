import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, message, Table, Image } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getItem } from '@/utils/localStorage';
import { unwrapResult } from '@reduxjs/toolkit';
import { useProduct } from '@/hooks/useProduct';
import ProductFormModal from './ProductFormModal';
import ProductDetailModal from './ProductDetailModal';

const ProductsPage: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [q, setQ] = useState('');
    const navigate = useNavigate();

    const { products, isLoading, error, fetchProductsByShop, updateProduct } = useProduct();

    useEffect(() => {
        // Get shopId from localStorage user object and call API with pageable payload
        try {
            const userStr = getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const shopId = user?.id as string | undefined;
            const pageable: IPageable = { page: 1, size: 1, sort: 'ASC' };
            if (shopId) {
                fetchProductsByShop(shopId, pageable);
            }
        } catch (e) {
            // fallback: no-op
        }
    }, [fetchProductsByShop]);

    useEffect(() => {
        if (error) message.error(error);
    }, [error]);

    const filtered = useMemo(() => {
        const kw = q.trim().toLowerCase();
        if (!kw) return products;
        return products.filter((p: IProduct) => p.name.toLowerCase().includes(kw));
    }, [q, products]);

    const handleOpenModalForEdit = (product: IProduct) => {
        setEditingProduct(product);
        setModalOpen(true);
    };

    const handleOpenDetail = (id: string) => {
        setDetailId(id);
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailId(null);
        setDetailOpen(false);
    };

    const handleCloseModal = () => {
        setEditingProduct(null);
        setModalOpen(false);
    };

    const handleSubmit = async (payload: any) => {
        try {
            if ('id' in payload) {
                const actionResult: any = await updateProduct(payload.id, payload);
                unwrapResult(actionResult);
                message.success('Cập nhật sản phẩm thành công');
            } else {
                // navigate to create page
                navigate('/vendor/products/create');
            }
            handleCloseModal();
        } catch (rejectedValue: any) {
            message.error(rejectedValue || 'Không thể lưu sản phẩm');
        }
    };

    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'images',
            key: 'images',
            width: 120,
            render: (images: string[]) => (images && images[0] ? <Image src={images[0]} width={80} /> : null),
        },
        { title: 'Tên', dataIndex: 'name', key: 'name' },
        { title: 'Giá (VND)', dataIndex: 'price', key: 'price', render: (v: number) => v?.toLocaleString() },
        { title: 'Tồn kho', dataIndex: 'stockQuantity', key: 'stockQuantity' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: IProduct) => (
                <div className="flex gap-2">
                    <Button size="small" onClick={() => handleOpenDetail(record.id)}>
                        Xem
                    </Button>
                    <Button size="small" onClick={() => handleOpenModalForEdit(record)}>
                        Sửa
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
                <Input placeholder="Tìm theo tên sản phẩm" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
                <Button type="primary" className="!bg-indigo-600" onClick={() => navigate('/vendor/products/create')}>
                    Thêm sản phẩm
                </Button>
            </div>

            <Table dataSource={filtered} columns={columns as any} rowKey="id" loading={isLoading} />

            <ProductFormModal open={modalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} editingProduct={editingProduct} loading={isLoading} />
            <ProductDetailModal productId={detailId} open={detailOpen} onClose={handleCloseDetail} />
        </div>
    );
};

export default ProductsPage;
