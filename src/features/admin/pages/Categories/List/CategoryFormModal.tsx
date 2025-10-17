import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Select, Switch } from 'antd';

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ICreateCategoryPayload | IUpdateCategoryPayload) => void;
  editingCategory: ICategory | null;
  loading: boolean;
  allCategories: ICategory[];
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  editingCategory,
  loading,
  allCategories,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (editingCategory) {
        form.setFieldsValue({
          ...editingCategory,
          parent: editingCategory.parent || null, 
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ active: true });
      }
    }
  }, [editingCategory, open, form]);

  const handleFinish = (values: any) => {
    if (editingCategory) {
      const payload: IUpdateCategoryPayload = {
        id: editingCategory.id,
        ...values,
        parent: values.parent || null, 
      };
      onSubmit(payload);
    } else {
      const payload: ICreateCategoryPayload = {
        ...values,
        parent: values.parent || null,
      };
      onSubmit(payload);
    }
  };

  return (
    <Modal /* ... */ >
      <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-6">
        <Form.Item
          name="name"
          label="Tên danh mục"
          rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="imageUrl"
          label="URL Hình ảnh"
          rules={[{ required: true, message: 'Vui lòng nhập URL hình ảnh!' }]}
        >
          <Input placeholder="https://example.com/image.png" />
        </Form.Item>

        <Form.Item name="parent" label="Danh mục cha">
          <Select allowClear placeholder="Chọn danh mục cha (nếu có)">
            {/* Lọc ra danh mục đang chỉnh sửa khỏi danh sách cha */}
            {allCategories
              .filter(cat => cat.id !== editingCategory?.id)
              .map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item name="active" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng" />
        </Form.Item>
        
        <Form.Item className="text-right">
          <Button onClick={onClose} style={{ marginRight: 8 }}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={loading} className="bg-indigo-600">
            Lưu
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryFormModal;
