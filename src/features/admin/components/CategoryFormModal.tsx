import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { AppCategory, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category.type';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCategoryRequest | UpdateCategoryRequest, id?: string) => Promise<void> | void;
  categories: AppCategory[]; // for parent select
  editing?: AppCategory | null;
  loading?: boolean;
};

const CategoryFormModal: React.FC<Props> = ({ open, onClose, onSubmit, categories, editing, loading }) => {
  const [form] = Form.useForm<CreateCategoryRequest & UpdateCategoryRequest>();

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (editing) {
      form.setFieldsValue({
        name: editing.name,
        parentId: editing.parent?.id,
        isActive: editing.active,
      });
    } else {
      form.setFieldsValue({ isActive: true });
    }
  }, [open, editing, form]);

  const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const fileList = (values as any).image as any[] | undefined;
      const file = fileList && fileList[0]?.originFileObj;
      const payload: CreateCategoryRequest | UpdateCategoryRequest = {
        name: values.name!,
        parentId: values.parentId || undefined,
        isActive: values.isActive,
        image: file || undefined,
      };
      await onSubmit(payload, editing?.id);
      onClose();
    } catch (e: any) {
      if (e?.errorFields) return; // form error
      message.error(e?.message || 'Không thể lưu danh mục');
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      title={editing ? 'Cập nhật danh mục' : 'Tạo danh mục'}
      okText={editing ? 'Cập nhật' : 'Tạo mới'}
      cancelText="Huỷ"
    >
      <Form form={form} layout="vertical" disabled={loading}>
        <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
          <Input placeholder="Smartphones" />
        </Form.Item>
        <Form.Item name="parentId" label="Danh mục cha">
          <Select allowClear placeholder="Chọn danh mục cha">
            {categories.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng" />
        </Form.Item>
        <Form.Item name="image" label="Ảnh" valuePropName="fileList" getValueFromEvent={normFile}>
          <Upload beforeUpload={() => false} maxCount={1} accept="image/*">
            <button type="button" className="ant-btn">
              <UploadOutlined /> <span className="ml-1">Chọn ảnh</span>
            </button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryFormModal;
