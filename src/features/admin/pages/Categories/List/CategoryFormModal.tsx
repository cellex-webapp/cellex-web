import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Select, Upload, Card, Space, Switch } from 'antd';
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
    if (editingCategory) {
      form.setFieldsValue({
        name: editingCategory.name,
        description: editingCategory.description,
        parentId: editingCategory.parentId || null,
        isActive: editingCategory.isActive ?? true,
      });

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
    }
  }, [editingCategory, form]);

  const handleFinish = (values: any) => {
    const imageFile = fileList.length > 0 && fileList[0].originFileObj ? fileList[0].originFileObj : undefined;

    const payload: ICreateCategoryPayload | IUpdateCategoryPayload = {
      ...values,
      parentId: values.parentId || null,
      image: imageFile,
    };

    if (editingCategory) {
      (payload as IUpdateCategoryPayload).id = editingCategory.id;
    }

    onSubmit(payload);
  };

  const handleCancel = () => {
    onClose();
  };

  const filterOption = (input: string, option: any) =>
    (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase());

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      title={
        <Space>
          <AppstoreOutlined style={{ fontSize: 18, color: '#1890ff' }} />
          <span className="font-semibold">{editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}</span>
        </Space>
      }
      width={650}
      style={{ top: 40 }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ isActive: true }}>
        <Card size="small" className="mb-4" title={<Space><PictureOutlined />Hình ảnh danh mục</Space>}>
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

        <Card size="small" className="mb-4" title={<Space><AppstoreOutlined />Thông tin cơ bản</Space>}>
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[
              { required: true, message: 'Vui lòng nhập tên danh mục!' },
              { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự' },
              { max: 100, message: 'Tên danh mục không quá 100 ký tự' },
            ]}
          >
            <Input placeholder="Nhập tên danh mục" showCount maxLength={100} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea
              rows={3}
              placeholder="Nhập mô tả về danh mục..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Vô hiệu" />
          </Form.Item>
        </Card>

        <Card size="small" className="mb-4" title={<Space><AppstoreOutlined />Phân cấp danh mục</Space>}>
          <Form.Item name="parentId" label="Danh mục cha" className="mb-0">
            <Select
              allowClear
              placeholder="Chọn danh mục cha (tùy chọn)"
              showSearch
              optionFilterProp="children"
              filterOption={filterOption}
            >
              {allCategories
                .filter((cat) => cat.id !== editingCategory?.id)
                .map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Card>

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