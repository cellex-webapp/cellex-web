import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Select, Switch, Upload, message, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getCategories, createCategory } from '@/services/categoryApi';
import type { AppCategory, CreateCategoryRequest } from '@/types/category.type';
import { useNavigate } from 'react-router-dom';

const CategoryCreatePage: React.FC = () => {
  type FormValues = CreateCategoryRequest & { image?: any[] };
  const [form] = Form.useForm<FormValues>();
  const [parents, setParents] = useState<AppCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadParents = async () => {
      try {
        const list = await getCategories();
        setParents(list);
      } catch (e: any) {
        message.error(e?.message || 'Không thể tải danh mục cha');
      }
    };
    loadParents();
    form.setFieldsValue({ isActive: true });
  }, [form]);

  const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const onFinish = async (values: FormValues) => {
    try {
      setLoading(true);
      const file = values.image && values.image[0]?.originFileObj;
      await createCategory({
        name: values.name,
        parentId: values.parentId || undefined,
        isActive: values.isActive,
        image: file || undefined,
      });
      message.success('Tạo danh mục thành công');
      navigate('/admin/categories');
    } catch (e: any) {
      message.error(e?.message || 'Không thể tạo danh mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Card title="Tạo danh mục" className="max-w-3xl mx-auto">
        <Form form={form} layout="vertical" onFinish={onFinish} disabled={loading}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}>
            <Input placeholder="Smartphones" />
          </Form.Item>
          <Form.Item name="parentId" label="Danh mục cha">
            <Select allowClear placeholder="Chọn danh mục cha">
              {parents.map((c) => (
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
          <div className="flex justify-end gap-2">
            <Button onClick={() => navigate('/admin/categories')}>Huỷ</Button>
            <Button type="primary" htmlType="submit" loading={loading} className="bg-indigo-600">Tạo danh mục</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CategoryCreatePage;
