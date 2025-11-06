import React, { useEffect, useMemo, useState } from 'react';
import { App, Input, Spin, Table, Tag, Badge } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { useCategory } from '@/hooks/useCategory';
import { attributeService } from '@/services/attribute.service';

type AttrCache = {
    loading: boolean;
    error?: string | null;
    items: IAttribute[];
};

const AttributeByCategoryPage: React.FC = () => {
    const { message } = App.useApp();
    const navigate = useNavigate();

    const { categories, isLoading, fetchAllCategories } = useCategory();
    const [q, setQ] = useState('');
    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
    const [attrByCat, setAttrByCat] = useState<Record<string, AttrCache>>({});

    useEffect(() => {
        fetchAllCategories();
    }, [fetchAllCategories]);

    const filteredCategories = useMemo(() => {
        const kw = q.trim().toLowerCase();
        if (!kw) return categories;
        return categories.filter((c) => c.name.toLowerCase().includes(kw));
    }, [q, categories]);

    const ensureLoadAttributes = async (categoryId: string) => {
        setAttrByCat((prev) => ({
            ...prev,
            [categoryId]: { ...(prev[categoryId] ?? { items: [] }), loading: true, error: null },
        }));
        try {
            const resp = await attributeService.getAttributesOfCategory(categoryId);
            const items = (resp.result || []) as IAttribute[];
            setAttrByCat((prev) => ({ ...prev, [categoryId]: { loading: false, error: null, items } }));
        } catch (e: any) {
            const errMsg = e?.response?.data?.message ?? e?.message ?? 'Lỗi tải thuộc tính';
            setAttrByCat((prev) => ({ ...prev, [categoryId]: { loading: false, error: errMsg, items: [] } }));
            message.error(errMsg);
        }
    };

    const onExpand = async (expanded: boolean, record: ICategory) => {
        const id = record.id;
        setExpandedRowKeys((prev) => (expanded ? [...prev, id] : prev.filter((k) => k !== id)));
        if (expanded && !attrByCat[id]) {
            await ensureLoadAttributes(id);
        }
    };

    const columns: ColumnsType<ICategory> = [
        {
            title: 'Ảnh',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            width: 80,
            render: (url: string) =>
                url ? (
                    <img
                        src={url}
                        alt="thumb"
                        style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }}
                    />
                ) : null,
        },
        { title: 'Tên danh mục', dataIndex: 'name', key: 'name' },
    ];

    const expandedRowRender = (cat: ICategory) => {
        const cache = attrByCat[cat.id];
        if (!cache || cache.loading) {
            return (
                <div className="py-6 text-center">
                    <Spin />
                </div>
            );
        }
        if (cache.error) {
            return <div className="py-4 text-red-500">{cache.error}</div>;
        }

        const attrs = cache.items || [];
        const cols: ColumnsType<IAttribute> = [
            {
                title: 'Tên thuộc tính',
                dataIndex: 'attributeName',
                key: 'attributeName',
            },
            {
                title: 'Key',
                dataIndex: 'attributeKey',
                key: 'attributeKey',
                render: (text: string) => (
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm">{text}</code>
                ),
            },
            {
                title: 'Loại dữ liệu',
                dataIndex: 'dataType',
                key: 'dataType',
                render: (type: DataType) => {
                    const colorMap: Record<DataType, string> = {
                        TEXT: 'blue',
                        NUMBER: 'green',
                        BOOLEAN: 'orange',
                        SELECT: 'purple',
                        MULTI_SELECT: 'magenta',
                    };
                    return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
                },
            },
            { title: 'Đơn vị', dataIndex: 'unit', key: 'unit', render: (u?: string) => u || '—' },
            {
                title: 'Bắt buộc',
                dataIndex: 'isRequired',
                key: 'isRequired',
                render: (v: boolean) => (
                    <Badge status={v ? 'success' : 'default'} text={v ? 'Có' : 'Không'} />
                ),
                width: 120,
            },
            {
                title: 'Nổi bật',
                dataIndex: 'isHighlight',
                key: 'isHighlight',
                render: (v: boolean) => (
                    <Badge status={v ? 'warning' : 'default'} text={v ? 'Có' : 'Không'} />
                ),
                width: 120,
            },
            { title: 'Thứ tự', dataIndex: 'sortOrder', key: 'sortOrder', width: 100 },
        ];

        return (
            <Table
                size="small"
                rowKey="id"
                columns={cols}
                dataSource={attrs}
                pagination={false}
            />
        );
    };

    return (
        <div className="p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
                <Input
                    placeholder="Tìm theo tên danh mục..."
                    prefix={<SearchOutlined />}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="max-w-sm"
                    allowClear
                />
            </div>

            <Table
                rowKey="id"
                loading={isLoading}
                dataSource={filteredCategories}
                columns={columns}
                expandable={{
                    expandedRowKeys,
                    onExpand,
                    expandedRowRender,
                    expandRowByClick: false,
                }}
                onRow={(record) => ({
                    onClick: () => {
                        navigate(`/admin/categories/${(record as any).slug}/attributes`);
                    },
                })}
                pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} danh mục` }}
            />
        </div>
    );
};

export default AttributeByCategoryPage;