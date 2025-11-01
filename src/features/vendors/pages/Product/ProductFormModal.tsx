import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, Upload, Switch, Select } from 'antd';
import { useCategory } from '@/hooks/useCategory';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: any) => void;
    editingProduct?: IProduct | null;
    loading?: boolean;
}

const ProductFormModal: React.FC<Props> = ({ open, onClose, onSubmit, editingProduct, loading }) => {
    const [form] = Form.useForm<any>();
    const { categories, fetchAllCategories } = useCategory();

    useEffect(() => {
        // Load categories once for category select
        if (!categories || categories.length === 0) {
            fetchAllCategories();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (editingProduct) {
            form.setFieldsValue({
                id: editingProduct.id,
                name: editingProduct.name,
                description: editingProduct.description,
                price: editingProduct.price,
                saleOff: editingProduct.saleOff,
                stockQuantity: editingProduct.stockQuantity,
                isPublished: editingProduct.isPublished,
                categoryId: (editingProduct as any)?.categoryId,
                attributeValues: (editingProduct as any)?.attributeValues,
            });
        } else {
            form.resetFields();
        }
    }, [editingProduct, form]);

    const handleUploadChange = (info: any) => {
        const files = (info?.fileList || []).map((f: any) => f.originFileObj || f.file || f);
        form.setFieldsValue({ images: files.length > 0 ? files : null });
    };

    const handleFinish = (values: any) => {
        // include id when editing
        if (editingProduct) values.id = editingProduct.id;
        onSubmit(values);
    };

    return (
        <Modal open={open} onCancel={onClose} footer={null} title={editingProduct ? 'Sửa sản phẩm' : 'Tạo sản phẩm'}>
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item name="categoryId" label="Danh mục" rules={[{ required: !editingProduct, message: 'Chọn danh mục' }]}>
                    <Select
                        placeholder="Chọn danh mục"
                        options={(categories || []).map((c: any) => ({ value: c.id, label: c.name }))}
                        showSearch
                        optionFilterProp="label"
                    />
                </Form.Item>
                <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item name="price" label="Giá (VND)">
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="saleOff" label="Giảm giá (%)">
                    <InputNumber style={{ width: '100%' }} min={0} max={100} />
                </Form.Item>

                <Form.Item name="stockQuantity" label="Số lượng tồn kho">
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item label="Ảnh">
                    <Form.Item name="images" valuePropName="fileList" getValueFromEvent={(e) => e?.fileList} noStyle>
                        <Upload beforeUpload={() => false} onChange={handleUploadChange} accept="image/*" multiple maxCount={8} listType="picture-card">
                            <Button>Chọn ảnh</Button>
                        </Upload>
                    </Form.Item>
                </Form.Item>

                <Form.Item name="attributeValues" label="Thuộc tính (JSON)">
                    <Input.TextArea rows={4} placeholder='Ví dụ: {"color":"red","size":"M"}' />
                </Form.Item>

                <Form.Item name="isPublished" label="Đã xuất bản" valuePropName="checked" initialValue={true}>
                    <Switch checkedChildren="Có" unCheckedChildren="Không" />
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Lưu
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default ProductFormModal;
