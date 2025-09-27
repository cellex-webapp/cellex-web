import React from "react";
import { Form, Input, InputNumber, Modal, Select, Switch } from "antd";
import type { FormInstance } from "antd";
import type { CategoryFormValues } from "../useCategories";

interface Props {
  open: boolean;
  loading?: boolean;
  mode: "create" | "edit";
  form: FormInstance<CategoryFormValues>;
  parentOptions: { value: string; label: string }[];
  currentId?: string;
  onCancel: () => void;
  onOk: () => void;
}

const CategoryFormModal: React.FC<Props> = ({
  open,
  loading,
  mode,
  form,
  parentOptions,
  currentId,
  onCancel,
  onOk,
}) => {
  return (
    <Modal
      title={mode === "create" ? "Thêm danh mục" : `Sửa danh mục`}
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      okText={mode === "create" ? "Tạo" : "Lưu"}
      confirmLoading={loading}
      destroyOnClose
      maskClosable={false}
      width={720}
    >
      <Form<CategoryFormValues> form={form} layout="vertical" initialValues={{ isActive: true }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
          >
            <Input placeholder="Ví dụ: Điện thoại" />
          </Form.Item>

          <Form.Item name="parentId" label="Danh mục cha">
            <Select
              allowClear
              placeholder="Chọn danh mục cha (tuỳ chọn)"
              options={parentOptions.filter((o) => (currentId ? o.value !== currentId : true))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item name="imageUrl" label="Link hình ảnh">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item name="sortOrder" label="Thứ tự">
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả" className="md:col-span-2">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn cho danh mục" />
          </Form.Item>

          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default CategoryFormModal;
