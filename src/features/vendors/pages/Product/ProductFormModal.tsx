import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, Upload, Switch, Select, Row, Col, Card, Space, Typography, Alert, message } from 'antd';
import { PlusOutlined, AppstoreAddOutlined, DollarCircleOutlined, PictureOutlined, UnorderedListOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useCategory } from '@/hooks/useCategory';
import AttributeEditor from './AttributeEditor';
import ProductVariantEditor from './ProductVariantEditor';
import type { UploadFile } from 'antd/es/upload/interface';

const { Text } = Typography;

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
  const [hasVariants, setHasVariants] = useState(false);

  useEffect(() => {
    if (categories.length === 0) fetchAllCategories();
  }, [categories.length, fetchAllCategories]);

  useEffect(() => {
    if (editingProduct) {
      const attributeItems = editingProduct.attributeValues?.map(av => ({
        attributeId: av.attributeId,
        value: av.value
      })) || [];

      const _hasVariants = !!(editingProduct.variationOptions && editingProduct.variationOptions.length > 0);
      setHasVariants(_hasVariants);

      form.setFieldsValue({
        ...editingProduct,
        categoryId: editingProduct.categoryInfo?.id || editingProduct.categoryId,
        attributeItems,
        variationOptions: editingProduct.variationOptions || [],
        skus: editingProduct.skus || [],
        images: editingProduct.images?.map((url, idx) => ({
          uid: `-${idx}`,
          name: `Ảnh ${idx + 1}`,
          status: 'done',
          url: url,
        })) || [],
      });
    } else {
      form.resetFields();
      setHasVariants(false);
      form.setFieldsValue({ isPublished: true, saleOff: 0, stockQuantity: 0 });
    }
  }, [editingProduct, form]);

  const handleFinish = (values: any) => {
    const attributeValues = (values.attributeItems || [])
      .filter((i: any) => i?.attributeId && i?.value)
      .map((i: any) => ({ attributeId: String(i.attributeId), value: String(i.value) }));

    const images = (values.images || []).map((f: UploadFile) => f.originFileObj || f.url || f);

    const payload: any = {
      ...values,
      saleOff: Number(values.saleOff) || 0,
      attributeValues,
      images,
    };

    if (hasVariants) {
      payload.price = 0; // Sẽ được tính lại ở backend từ giá thấp nhất của SKU
      payload.stockQuantity = 0; // Sẽ được tính lại ở backend từ tổng tồn kho các SKU
      payload.variationOptions = values.variationOptions || [];
      payload.skus = values.skus || [];
      
      if (payload.skus.length === 0) {
        message.error('Vui lòng tạo ít nhất 1 SKU cho sản phẩm có biến thể');
        return;
      }
    } else {
      payload.price = Number(values.price);
      payload.stockQuantity = Number(values.stockQuantity);
      payload.variationOptions = [];
      payload.skus = [];
    }

    if (editingProduct?.id) {
      payload.id = editingProduct.id;
    }

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
      title={<span className="font-semibold text-lg text-indigo-700">{editingProduct ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}</span>}
      width={1000}
      style={{ top: 20 }}
      maskClosable={false}
      destroyOnClose
      className="product-form-modal"
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
        <Card size="small" className="mb-4 shadow-sm border-gray-100" title={<Space><AppstoreAddOutlined className="text-indigo-500" />Thông tin cơ bản</Space>}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="categoryId" label="Danh mục sản phẩm" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                <Select 
                  showSearch 
                  optionFilterProp="label"
                  placeholder="Chọn danh mục" 
                  options={categories.map(c => ({ value: c.id, label: c.name }))} 
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}>
                <Input placeholder="Ví dụ: iPhone 15 Pro Max..." count={{ show: true, max: 150 }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Mô tả sản phẩm">
             <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết về sản phẩm..." showCount maxLength={2000} />
          </Form.Item>
        </Card>

        <Card size="small" className="mb-4 shadow-sm border-gray-100" title={
          <div className="flex justify-between items-center w-full">
            <Space><DollarCircleOutlined className="text-emerald-500" />Thiết lập Biến thể & Kho</Space>
            <div className="flex items-center gap-2 font-normal text-sm bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              <Switch size="small" checked={hasVariants} onChange={setHasVariants} />
              <span className="text-indigo-700 font-medium">Sản phẩm có nhiều biến thể (Màu sắc, kích thước...)</span>
            </div>
          </div>
        }>
          {!hasVariants && (
            <Row gutter={16}>
               <Col span={6}>
                  <Form.Item name="price" label="Giá bán gốc (VND)" rules={[{ required: true, message: 'Nhập giá' }]}>
                    <InputNumber<number>
                        style={{ width: '100%' }} 
                        min={0} 
                        placeholder="0"
                        formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                      parser={v => Number((v || '').replace(/\$\s?|(,*)/g, ''))}
                     />
                  </Form.Item>
               </Col>
               <Col span={6}>
                  <Form.Item name="saleOff" label="Giảm giá (%)">
                     <InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="0" />
                  </Form.Item>
               </Col>
               <Col span={6}>
                  <Form.Item label="Giá sau giảm">
                     <InputNumber 
                        style={{ width: '100%' }} 
                        value={finalPrice} 
                        disabled 
                        className="bg-gray-50 font-bold text-emerald-600"
                        formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                     />
                  </Form.Item>
               </Col>
               <Col span={6}>
                  <Form.Item name="stockQuantity" label="Số lượng tồn kho" rules={[{ required: true, message: 'Nhập tồn kho' }]}>
                     <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
               </Col>
            </Row>
          )}

          {hasVariants ? (
            <div className="mb-2">
              <Alert 
                type="info" 
                showIcon 
                icon={<InfoCircleOutlined />}
                message="Chế độ biến thể đang bật"
                description="Giá bán và Tổng tồn kho sẽ được hệ thống tính toán tự động dựa trên danh sách các SKU bên dưới."
                className="mb-4"
              />
              <ProductVariantEditor form={form} initialSkus={editingProduct?.skus} />
            </div>
          ) : null}
        </Card>

        <Card size="small" className="mb-4 shadow-sm border-gray-100" title={<Space><UnorderedListOutlined className="text-amber-500" />Thông số kỹ thuật (Attributes)</Space>}>
           <AttributeEditor form={form} />
        </Card>

        <Card size="small" className="mb-4 shadow-sm border-gray-100" title={<Space><PictureOutlined className="text-rose-500" />Bộ sưu tập hình ảnh</Space>}>
           <Form.Item name="images" valuePropName="fileList" getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList} noStyle>
              <Upload 
                listType="picture-card" 
                beforeUpload={() => false} 
                maxCount={8} 
                multiple 
                accept="image/*"
              >
                 <div className="flex flex-col items-center">
                    <PlusOutlined />
                    <div className="mt-2 text-xs">Tải ảnh lên</div>
                 </div>
              </Upload>
           </Form.Item>
           <Text type="secondary" className="text-[11px] block mt-2">* Tối đa 8 ảnh. Ảnh đầu tiên sẽ là ảnh đại diện chính của sản phẩm.</Text>
        </Card>

        <div className="flex justify-between items-center py-4 px-2 bg-gray-50 rounded-lg border border-gray-200">
          <Form.Item name="isPublished" label={null} valuePropName="checked" className="!mb-0">
             <Space size="middle">
                <span className="font-medium text-gray-700">Trạng thái hiển thị:</span>
                <Switch checkedChildren="Đang bán" unCheckedChildren="Bản nháp" className="bg-gray-400" />
             </Space>
          </Form.Item>
          
          <div className="flex gap-3">
             <Button onClick={onClose} className="px-6">Hủy bỏ</Button>
             <Button type="primary" htmlType="submit" loading={loading} className="px-8 !bg-indigo-600 hover:!bg-indigo-700">
                {editingProduct ? 'Cập nhật Sản phẩm' : 'Lưu Sản phẩm'}
             </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default ProductFormModal;