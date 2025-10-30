import React, { useEffect } from 'react';
import { Button, Form, Input, Select, Switch, message, Card, Row, Col, Upload } from 'antd';
import { useNavigate } from 'react-router-dom';
import { unwrapResult } from '@reduxjs/toolkit';
import { useCategory } from '@/hooks/useCategory';

type FormValues = Omit<ICreateCategoryPayload, 'image' | 'isActive'> & {
  image?: File | null;
  isActive?: boolean;
};

const CategoryCreatePage: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const navigate = useNavigate();

  const { categories, isLoading, fetchAllCategories, createCategory } = useCategory();

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  const handleUploadChange = (info: any) => {
    if (info && Array.isArray(info.fileList) && info.fileList.length === 0) {
      form.setFieldsValue({ image: null });
      return;
    }

    const file = info?.file?.originFileObj || info?.file;
    if (file) {
      form.setFieldsValue({ image: file });
    }
  };

  const onFinish = async (values: FormValues) => {
    try {
      const fd = new FormData();

      fd.append('name', values.name);

      if (values.description) {
        fd.append('description', values.description);
      }
      if (values.parentId) {
        fd.append('parentId', values.parentId);
      }

      fd.append('isActive', String(values.isActive ?? true));

      const imageFile = values.image;
      if (imageFile && imageFile instanceof File) {
        fd.append('image', imageFile, imageFile.name || 'image');
      }

      const actionResult = await createCategory(fd as any);
      unwrapResult(actionResult);

      message.success('Tạo danh mục thành công');
      navigate('/admin/categories');
    } catch (rejectedValue: any) {
      message.error(rejectedValue?.message || rejectedValue || 'Không thể tạo danh mục');
    }
  };

  return (
    <div className="p-4 flex justify-center">
      <div style={{ width: '100%', maxWidth: 900 }}>
        <h1 className="mb-4 text-xl font-semibold">Tạo danh mục</h1>
        <Card bodyStyle={{ padding: 18 }}>
          <Form form={form} layout="vertical" onFinish={onFinish} disabled={isLoading}>
            <Row gutter={16} align="bottom">
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Tên danh mục"
                  rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                >
                  <Input placeholder="Ví dụ: Điện thoại thông minh" size="large" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item name="description" label="Mô tả">
                  <Input.TextArea rows={4} placeholder="Mô tả ngắn về danh mục" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item label="Ảnh đại diện">
                  <Form.Item name="image" valuePropName="file" noStyle>
                    <Upload
                      beforeUpload={() => false}
                      onChange={handleUploadChange}
                      maxCount={1}
                      accept="image/*"
                      listType="picture"
                    >
                      <Button>Chọn ảnh</Button>
                    </Upload>
                  </Form.Item>
                </Form.Item>
              </Col>

              <Col xs={24} md={16}>
                <Form.Item name="parentId" label="Danh mục cha (nếu có)">
                  <Select allowClear placeholder="Chọn danh mục cha">
                    {categories.map((c) => (
                      <Select.Option key={c.id} value={c.id}>
                        {c.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="isActive"
                  label="Trạng thái"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <Button onClick={() => navigate('/admin/categories')} style={{ marginRight: 8 }}>
            Huỷ
          </Button>
          <Button type="primary" onClick={() => form.submit()} loading={isLoading}>
            Tạo danh mục
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CategoryCreatePage;