import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Select, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

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
          name: editingCategory.name,
          description: editingCategory.description,
          parentId: editingCategory.parentId || null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [editingCategory, open, form]);

  const handleFinish = (values: any) => {
    if (editingCategory) {
      const payload: IUpdateCategoryPayload = {
        id: editingCategory.id,
        name: values.name,
        description: values.description,
        parentId: values.parentId || null,
        image: values.image && values.image.file ? values.image.file : undefined,
      };
      onSubmit(payload);
    } else {
      const payload: ICreateCategoryPayload = {
        name: values.name,
        description: values.description,
        parentId: values.parentId || null,
        image: values.image && values.image.file ? values.image.file : undefined,
      };
      onSubmit(payload);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục'}
      style={{ top: 40 }}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-6">
        <Form.Item
          name="name"
          label="Tên danh mục"
          rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item name="image" label="Hình ảnh">
          <Upload beforeUpload={() => false} maxCount={1} accept="image/*">
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>

        <Form.Item name="parentId" label="Danh mục cha">
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

        {/* only name, description, parentId and image are submitted */}
        
        <Form.Item className="text-right">
          <Button onClick={onClose} style={{ marginRight: 8 }}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={loading} className="!bg-indigo-600">
            Lưu
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryFormModal;
