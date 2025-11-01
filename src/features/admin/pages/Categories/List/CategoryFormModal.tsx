import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Select, Upload, Card, Space } from 'antd';
import { UploadOutlined, AppstoreOutlined, PictureOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

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
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (open) {
      if (editingCategory) {
        form.setFieldsValue({
          name: editingCategory.name,
          description: editingCategory.description,
          parentId: editingCategory.parentId || null,
        });
        // Set existing image if available
        if (editingCategory.imageUrl) {
          setFileList([
            {
              uid: '-1',
              name: 'image.png',
              status: 'done',
              url: editingCategory.imageUrl,
            },
          ]);
        } else {
          setFileList([]);
        }
      } else {
        form.resetFields();
        setFileList([]);
      }
    }
  }, [editingCategory, open, form]);

  const handleFinish = (values: any) => {
    const imageFile = fileList.length > 0 && fileList[0].originFileObj ? fileList[0].originFileObj : undefined;
    
    if (editingCategory) {
      const payload: IUpdateCategoryPayload = {
        id: editingCategory.id,
        name: values.name,
        description: values.description,
        parentId: values.parentId || null,
        image: imageFile,
      };
      onSubmit(payload);
    } else {
      const payload: ICreateCategoryPayload = {
        name: values.name,
        description: values.description,
        parentId: values.parentId || null,
        image: imageFile,
      };
      onSubmit(payload);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      title={
        <Space>
          <AppstoreOutlined style={{ fontSize: 18, color: '#1890ff' }} />
          <span className="font-semibold">
            {editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
          </span>
        </Space>
      }
      width={650}
      style={{ top: 40 }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {/* Hình ảnh */}
        <Card 
          size="small" 
          className="mb-4" 
          title={<Space><PictureOutlined />Hình ảnh danh mục</Space>}
        >
          <Form.Item className="mb-0">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
            >
              {fileList.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Card>

        {/* Thông tin cơ bản */}
        <Card 
          size="small" 
          className="mb-4" 
          title={<Space><AppstoreOutlined />Thông tin cơ bản</Space>}
        >
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[
              { required: true, message: 'Vui lòng nhập tên danh mục!' },
              { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự' },
              { max: 100, message: 'Tên danh mục không quá 100 ký tự' }
            ]}
          >
            <Input 
              placeholder="Nhập tên danh mục" 
              showCount
              maxLength={100}
            />
          </Form.Item>

          <Form.Item 
            name="description" 
            label="Mô tả"
            className="mb-0"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Nhập mô tả về danh mục..."
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Card>

        {/* Phân cấp danh mục */}
        <Card 
          size="small" 
          className="mb-4" 
          title={<Space><AppstoreOutlined />Phân cấp danh mục</Space>}
        >
          <Form.Item 
            name="parentId" 
            label="Danh mục cha"
            className="mb-0"
          >
            <Select 
              allowClear 
              placeholder="Chọn danh mục cha (tùy chọn)"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => {
                const children = option?.children;
                const text =
                  typeof children === 'string'
                    ? children
                    : Array.isArray(children)
                    ? children.join(' ')
                    : children
                    ? String(children)
                    : '';
                return text.toLowerCase().includes(input.toLowerCase());
              }}
            >
              {allCategories
                .filter(cat => cat.id !== editingCategory?.id)
                .map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Card>
        
        {/* Action Buttons */}
        <Form.Item className="mb-0">
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={handleCancel} size="large">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              {editingCategory ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryFormModal;