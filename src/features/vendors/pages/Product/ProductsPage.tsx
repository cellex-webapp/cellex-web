import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Input, App, Table, Image, Tag, Tooltip, Space } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined, AppstoreOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { unwrapResult } from '@reduxjs/toolkit';
import { useProduct } from '@/hooks/useProduct';
import ProductFormModal from './ProductFormModal';
import ProductDetailModal from './ProductDetailModal';
import { shopService } from '@/services/shop.service';
import { useDebounce } from '@/hooks/useDebounce';

const ProductPageContent: React.FC = () => {
    const { message, modal } = App.useApp();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [q, setQ] = useState('');
    const debouncedQ = useDebounce(q, 350);

    const { products, isLoading, pagination, fetchMyProducts, updateProduct, createProduct, deleteProduct } = useProduct();

    const [shopId, setShopId] = useState<string | null>(null);
    const [shopVerified, setShopVerified] = useState<boolean>(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [total, setTotal] = useState(0);

    useEffect(() => {
    (async () => {
      try {
        const resp = await shopService.getMyShop();
        setShopVerified((resp.result as any)?.status === 'APPROVED');
      } catch (e) {
        setShopVerified(false);
      }
    })();
  }, []);

    const loadData = useCallback(() => {
    fetchMyProducts({ 
      page: pagination.page, // Use current page from Redux (or controlled by Table)
      limit: pagination.limit, 
      search: debouncedQ 
    });
  }, [fetchMyProducts, pagination.page, pagination.limit, debouncedQ]);

    useEffect(() => {
    fetchMyProducts({ page: 1, limit: 10, search: debouncedQ });
  }, [debouncedQ, fetchMyProducts]);

  

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
                if (!shopVerified) {
                    message.error('Cửa hàng của bạn chưa được xác minh. Vui lòng hoàn tất xác minh để tạo sản phẩm.');
                    return;
                }
                const actionResult: any = await createProduct(payload);
                unwrapResult(actionResult);
                message.success('Tạo sản phẩm thành công');
            }
            handleCloseModal();
            loadData();
        } catch (rejectedValue: any) {
            message.error(rejectedValue || 'Không thể lưu sản phẩm');
        }
    };

    const handleDelete = (id: string) => {
        modal.confirm({
            title: 'Bạn có chắc muốn xóa sản phẩm này?',
            content: 'Hành động này sẽ xóa sản phẩm vĩnh viễn.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            centered: true,
            onOk: async () => {
                try {
                    const actionResult: any = await deleteProduct(id);
                    unwrapResult(actionResult);
                    message.success('Đã xóa sản phẩm');
                    loadData();
                } catch (err: any) {
                    message.error(err || 'Không thể xóa sản phẩm');
                }
            },
        });
    };

    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'images',
            key: 'images',
            width: 80,
            render: (images: string[]) =>
                images && images[0] ? (
                    <Image
                        src={images[0]}
                        width={60}
                        height={60}
                        style={{ objectFit: 'cover', borderRadius: 6 }}
                        preview={{ mask: <EyeOutlined /> }}
                    />
                ) : (
                    <div className="w-[60px] h-[60px] bg-gray-100 rounded flex items-center justify-center">
                        <AppstoreOutlined className="text-gray-400" />
                    </div>
                ),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            width: 220,
            ellipsis: true,
            render: (text: string) => (
                <span className="font-medium" title={text}>
                    {text}
                </span>
            ),
        },
        {
            title: 'Danh mục',
            key: 'category',
            width: 130,
            ellipsis: true,
            render: (_: any, r: IProduct) => <Tag color="blue" style={{ margin: 0 }}>{r.categoryInfo?.name || '-'}</Tag>,
        },
        {
            title: 'Giá cuối (VND)',
            dataIndex: 'finalPrice',
            key: 'finalPrice',
            width: 130,
            align: 'right' as const,
            render: (v: number) => <span className="font-medium text-orange-600">{v?.toLocaleString() || '0'}</span>,
        },
        {
            title: 'Tồn kho',
            dataIndex: 'stockQuantity',
            key: 'stockQuantity',
            width: 90,
            align: 'right' as const,
        },
        {
            title: 'Đã bán',
            dataIndex: 'purchaseCount',
            key: 'purchaseCount',
            width: 90,
            align: 'right' as const,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isPublished',
            key: 'isPublished',
            width: 110,
            align: 'center' as const,
            render: (v: boolean) => (
                <Tag icon={v ? <CheckCircleOutlined /> : undefined} color={v ? 'success' : 'default'} style={{ margin: 0 }}>
                    {v ? 'Xuất bản' : 'Nháp'}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (v: string) => (v ? new Date(v).toLocaleString('vi-VN') : '-'),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            align: 'center' as const,
            fixed: 'right',
            render: (_: any, record: IProduct) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined className='!text-blue-500' />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModalForEdit(record);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined className='!text-red-500' />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(record.id);
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold text-gray-800">Quản lý Sản phẩm</h3>
                    <Tooltip title={shopVerified ? 'Tạo sản phẩm mới' : 'Cửa hàng chưa được xác minh - không thể tạo sản phẩm'}>
                        <Button
                            type="primary"
                            className="!bg-indigo-600"
                            icon={<PlusOutlined />}
                            disabled={!shopVerified}
                            onClick={() => {
                                setEditingProduct(null);
                                setModalOpen(true);
                            }}
                        >
                            Thêm sản phẩm
                        </Button>
                    </Tooltip>
                </div>

                <div className="mb-3">
                    <Input
                        placeholder="Tìm theo tên sản phẩm"
                        prefix={<SearchOutlined />}
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="max-w-sm"
                        allowClear
                    />
                </div>

                <Table
                    dataSource={filtered}
                    columns={columns as any}
                    rowKey="id"
                    loading={isLoading}
                    scroll={{ x: 1300 }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        showSizeChanger: true,
                        showTotal: (t) => `Tổng ${t} sản phẩm`,
                    }}
                    onRow={(record) => ({
                        onClick: () => handleOpenDetail(record.id),
                        className: 'cursor-pointer hover:bg-gray-50'
                    })}
                    onChange={(pagination) => {
                        const nextPage = pagination.current || 1;
                        const nextSize = pagination.pageSize || pageSize;
                        setPage(nextPage);
                        setPageSize(nextSize);
                    }}
                />
            </div>

            <ProductFormModal open={modalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} editingProduct={editingProduct} loading={isLoading} />
            <ProductDetailModal productId={detailId} open={detailOpen} onClose={handleCloseDetail} />
        </div>
    );
};

const ProductsPage: React.FC = () => {
    return (
        <App>
            <ProductPageContent />
        </App>
    );
};

export default ProductsPage;