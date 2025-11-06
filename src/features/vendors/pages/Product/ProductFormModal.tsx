import React, { useEffect, useMemo } from 'react';
import { Modal, Form, Input, InputNumber, Button, Upload, Switch, Select, Row, Col, Divider, Card, Space } from 'antd';
import { PlusOutlined, AppstoreAddOutlined, DollarCircleOutlined, FileTextOutlined, PictureOutlined } from '@ant-design/icons';
import { useCategory } from '@/hooks/useCategory';
import AttributeEditor from './AttributeEditor';

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
    if (!categories || categories.length === 0) {
      fetchAllCategories();
    }
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
        attributeItems: Array.isArray((editingProduct as any)?.attributeValues)
          ? ((editingProduct as any)?.attributeValues as IAttributeValue[]).map(av => ({ attributeId: av.attributeId, value: av.value }))
          : [],
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isPublished: true, saleOff: 0, stockQuantity: 0 });
    }
  }, [editingProduct, form]);

  const handleUploadChange = (info: any) => {
    const files = (info?.fileList || []).map(
      (f: any) => f.originFileObj || f.file || f
    );
    form.setFieldsValue({ images: files.length > 0 ? files : null });
  };

  const handleFinish = (values: any) => {
    if (editingProduct) values.id = editingProduct.id;
    if (values.price !== undefined) values.price = Number(values.price);
    if (values.saleOff !== undefined) values.saleOff = Number(values.saleOff);
    if (values.stockQuantity !== undefined)
      values.stockQuantity = Number(values.stockQuantity);

    if (Array.isArray(values.attributeItems)) {
      const cleaned = (values.attributeItems as Array<{ attributeId?: string; value?: string }>).
        filter(i => i && i.attributeId && (i.value ?? '') !== '').
        map(i => ({ attributeId: String(i.attributeId), value: String(i.value) }));
      if (cleaned.length > 0) {
        values.attributeValues = cleaned;
      }
      delete values.attributeItems;
    }

    if (Array.isArray(values.images)) {
      values.images = values.images.map((f: any) => f?.originFileObj || f);
    }

    if (typeof values.attributeValues === 'string' && values.attributeValues.trim()) {
      try {
        const parsed = JSON.parse(values.attributeValues.trim());
        if (Array.isArray(parsed)) {
          values.attributeValues = parsed;
        } else if (parsed && typeof parsed === 'object') {
          values.attributeValues = Object.entries(parsed).map(
            ([attributeId, value]) => ({ attributeId, value })
          );
        }
      } catch (e) { }
    }

    onSubmit(values);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Chọn ảnh</div>
    </div>
  );

  const price = Form.useWatch('price', form) as number | undefined;
  const saleOff = Form.useWatch('saleOff', form) as number | undefined;
  const finalPrice = useMemo(() => {
    const p = Number(price || 0);
    const s = Number(saleOff || 0);
    const discount = Math.max(0, Math.min(100, isNaN(s) ? 0 : s));
    return Math.round(p * (1 - discount / 100));
  }, [price, saleOff]);


  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <Space>
          <AppstoreAddOutlined style={{ color: '#1890ff' }} />
          <span className="font-semibold">
            {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}
          </span>
        </Space>
      }
      width={850} 
      style={{ top: 20 }} 
      maskClosable={false}
      destroyOnClose 
    >
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleFinish} 
        initialValues={{ isPublished: true, saleOff: 0, stockQuantity: 0 }}
      >

        <Card size="small" className="mb-4" title={<Space><AppstoreAddOutlined />Thông tin cơ bản</Space>}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="categoryId"
                label="Danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]} 
              >
                <Select
                  placeholder="Chọn danh mục"
                  options={(categories || []).map((c: any) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}
              >
                <Input placeholder="VD: iPhone 15 Pro" showCount maxLength={150} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card size="small" className="mb-4" title={<Space><DollarCircleOutlined />Giá & Kho hàng</Space>}>
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item
                name="price"
                label="Giá (VND)"
                rules={[{ required: true, message: 'Nhập giá' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={1000}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={((value: string | undefined) => value ? value.replace(/\$\s?|(,*)/g, '') : '') as any}
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="saleOff" label="Giảm giá (%)">
                <InputNumber style={{ width: '100%' }} min={0} max={100} step={1} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item label="Giá cuối (VND)">
                <InputNumber
                  style={{ width: '100%' }}
                  value={finalPrice}
                  readOnly
                  disabled
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item
                name="stockQuantity"
                label="Tồn kho"
                rules={[{ required: true, message: 'Nhập tồn kho' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card size="small" className="mb-4" title={<Space><FileTextOutlined />Mô tả & Thuộc tính</Space>}>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} placeholder="Mô tả chi tiết về sản phẩm..." showCount maxLength={2000} />
          </Form.Item>

          <AttributeEditor form={form} />
        </Card>

        <Card size="small" className="mb-4" title={<Space><PictureOutlined />Hình ảnh sản phẩm</Space>}>
          <Form.Item 
            label="Ảnh (tối đa 8 ảnh, ảnh đầu tiên là ảnh bìa)" 
            tooltip="Ảnh đầu tiên bạn tải lên sẽ được dùng làm ảnh bìa cho sản phẩm."
            className="mb-0"
          >
            <Form.Item
              name="images"
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList}
              noStyle
            >
              <Upload
                beforeUpload={() => false}
                onChange={handleUploadChange}
                accept="image/*"
                multiple
                maxCount={8}
                listType="picture-card"
              >
                {uploadButton}
              </Upload>
            </Form.Item>
          </Form.Item>
        </Card>

        <Form.Item
          name="isPublished"
          label="Trạng thái"
          valuePropName="checked"
        >
          <Switch checkedChildren="Xuất bản" unCheckedChildren="Nháp" />
        </Form.Item>

        <Divider style={{ margin: '12px 0' }} />

        <div className="flex justify-end gap-2">
          <Button onClick={onClose} size="large">Hủy</Button>
          <Button type="primary" htmlType="submit" loading={loading} size="large">
            {editingProduct ? 'Cập nhật' : 'Lưu sản phẩm'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ProductFormModal;