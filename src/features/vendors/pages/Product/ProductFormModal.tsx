import React, { useEffect, useMemo } from 'react';
import { Modal, Form, Input, InputNumber, Button, Upload, Switch, Select, Row, Col, Card, Space } from 'antd';
import { PlusOutlined, AppstoreAddOutlined, DollarCircleOutlined, PictureOutlined } from '@ant-design/icons';
import { useCategory } from '@/hooks/useCategory';
import AttributeEditor from './AttributeEditor';
import type { UploadFile } from 'antd/es/upload/interface';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  editingProduct?: IProduct | null;
  loading?: boolean;
}

const ProductFormModal: React.FC<Props> = ({ open, onClose, onSubmit, editingProduct, loading }) => {
  const [form] = Form.useForm();
  const { categories, fetchAllCategories } = useCategory();

  useEffect(() => {
    if (categories.length === 0) fetchAllCategories();
  }, [categories.length, fetchAllCategories]);

  useEffect(() => {
    if (editingProduct) {
      const attributeItems = editingProduct.attributeValues?.map(av => ({
        attributeId: av.attributeId,
        value: av.value
      })) || [];

      form.setFieldsValue({
        ...editingProduct,
        categoryId: editingProduct.categoryInfo?.id || editingProduct.categoryId,
        attributeItems,
        images: editingProduct.images?.map((url, idx) => ({
          uid: `-${idx}`,
          name: `Image ${idx}`,
          status: 'done',
          url: url,
        })) || [],
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isPublished: true, saleOff: 0, stockQuantity: 0 });
    }
  }, [editingProduct, form]);

  const handleFinish = (values: any) => {
    const attributeValues = (values.attributeItems || [])
      .filter((i: any) => i?.attributeId && i?.value)
      .map((i: any) => ({ attributeId: String(i.attributeId), value: String(i.value) }));

    const images = (values.images || []).map((f: UploadFile) => f.originFileObj || f.url || f);

    const payload = {
      ...values,
      id: editingProduct?.id, 
      price: Number(values.price),
      saleOff: Number(values.saleOff),
      stockQuantity: Number(values.stockQuantity),
      attributeValues,
      images, 
    };

    delete payload.attributeItems; 
    onSubmit(payload);
  };

  const price = Form.useWatch('price', form);
  const saleOff = Form.useWatch('saleOff', form);
  
  const finalPrice = useMemo(() => {
    const p = Number(price || 0);
    const s = Number(saleOff || 0);
    if (p <= 0) return 0;
    return Math.round(p * (1 - s / 100));
  }, [price, saleOff]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={<span className="font-semibold">{editingProduct ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}</span>}
      width={850}
      style={{ top: 20 }}
      maskClosable={false}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Card size="small" className="mb-4" title={<Space><AppstoreAddOutlined />Thông tin cơ bản</Space>}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
                <Select 
                  showSearch 
                  optionFilterProp="label"
                  placeholder="Chọn danh mục" 
                  options={categories.map(c => ({ value: c.id, label: c.name }))} 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
                <Input placeholder="Nhập tên sản phẩm" count={{ show: true, max: 150 }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Mô tả">
             <Input.TextArea rows={4} showCount maxLength={2000} />
          </Form.Item>
        </Card>

        <Card size="small" className="mb-4" title={<Space><DollarCircleOutlined />Giá & Kho</Space>}>
          <Row gutter={16}>
             <Col span={8}>
                <Form.Item name="price" label="Giá gốc" rules={[{ required: true }]}>
                   <InputNumber style={{ width: '100%' }} min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                </Form.Item>
             </Col>
             <Col span={8}>
                <Form.Item name="saleOff" label="Giảm giá (%)">
                   <InputNumber style={{ width: '100%' }} min={0} max={100} />
                </Form.Item>
             </Col>
             <Col span={8}>
                <Form.Item label="Giá sau giảm">
                   <InputNumber style={{ width: '100%' }} value={finalPrice} disabled formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                </Form.Item>
             </Col>
             <Col span={8}>
                <Form.Item name="stockQuantity" label="Tồn kho" rules={[{ required: true }]}>
                   <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
             </Col>
          </Row>
        </Card>

        <Card size="small" className="mb-4">
           <AttributeEditor form={form} />
        </Card>

        <Card size="small" className="mb-4" title={<Space><PictureOutlined />Hình ảnh</Space>}>
           <Form.Item name="images" valuePropName="fileList" getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList} noStyle>
              <Upload listType="picture-card" beforeUpload={() => false} maxCount={8} multiple accept="image/*">
                 <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
              </Upload>
           </Form.Item>
        </Card>

        <Form.Item name="isPublished" label="Trạng thái" valuePropName="checked">
           <Switch checkedChildren="Xuất bản" unCheckedChildren="Nháp" />
        </Form.Item>

        <div className="flex justify-end gap-3 pt-4 border-t">
           <Button onClick={onClose}>Hủy</Button>
           <Button type="primary" htmlType="submit" loading={loading}>Lưu sản phẩm</Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ProductFormModal;