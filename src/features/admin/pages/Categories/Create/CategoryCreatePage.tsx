import React, { useEffect } from 'react';
import { Button, Form, Input, Select, Switch, message, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { unwrapResult } from '@reduxjs/toolkit';
import { useCategory } from '@/hooks/useCategory';

type FormValues = Omit<ICreateCategoryPayload, 'image'>;

const CategoryCreatePage: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const navigate = useNavigate();

  const { categories, isLoading, fetchAllCategories, createCategory } = useCategory();

  useEffect(() => {
    fetchAllCategories();
    form.setFieldsValue({ active: true });
  }, [fetchAllCategories, form]);

  const onFinish = async (values: FormValues) => {
    try {
      const payload: ICreateCategoryPayload = {
        name: values.name,
        imageUrl: values.imageUrl || '',
        parent: values.parent || '',
        active: values.active || false,
      };

      const actionResult = await createCategory(payload);
      unwrapResult(actionResult);

      message.success('Tạo danh mục thành công');
      navigate('/admin/categories');
    } catch (rejectedValue: any) {
      message.error(rejectedValue || 'Không thể tạo danh mục');
    }
  };

  return (
    <div className="p-4">
      <Card title="Tạo danh mục" className="max-w-3xl mx-auto">
        <Form form={form} layout="vertical" onFinish={onFinish} disabled={isLoading}>
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input placeholder="Ví dụ: Điện thoại thông minh" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn về danh mục" />
          </Form.Item>

          <Form.Item name="parentId" label="Danh mục cha (nếu có)">
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

          <div className="flex justify-end gap-2">
            <Button onClick={() => navigate('/admin/categories')}>Huỷ</Button>
            <Button type="primary" htmlType="submit" loading={isLoading} className="bg-indigo-600">
              Tạo danh mục
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CategoryCreatePage;