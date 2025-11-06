import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Select, Upload, Card, Space, Switch, Row, Col } from 'antd';
import { PlusOutlined, AppstoreOutlined, PictureOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import ImgCrop from 'antd-img-crop';

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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewTitle, setPreviewTitle] = useState<string>('');

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

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

  const handleUploadChange = async ({ file, fileList: list }: { file: UploadFile; fileList: UploadFile[] }) => {
    let newList = [...list];
    if (newList.length > 0) {
      const last = newList[newList.length - 1];
      if (last.originFileObj && !last.thumbUrl && !last.url) {
        try {
          last.thumbUrl = await getBase64(last.originFileObj as File);
        } catch { }
      }
      newList = [last];
    }
    setFileList(newList);
  };

  const handlePreview = async (file: UploadFile) => {
    try {
      if (!file.url && !file.thumbUrl && file.originFileObj) {
        file.thumbUrl = await getBase64(file.originFileObj as File);
      }
      const src = (file.url || file.thumbUrl) as string | undefined;
      if (src) {
        setPreviewImage(src);
        setPreviewTitle(file.name || 'Xem ảnh');
        setPreviewOpen(true);
      }
    } catch { }
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      title={
        <Space>
          <span className="font-semibold">{editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}</span>
        </Space>
      }
      width={720}
      style={{ top: 40 }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ isActive: true }}>
        <Row gutter={16}>
          <Col xs={24} md={10} lg={9}>
            <Card size="small" className="mb-4" title={<Space><PictureOutlined />Hình ảnh</Space>}>
              <Form.Item className="mb-0 flex justify-center">
                <ImgCrop rotationSlider modalTitle="Chỉnh sửa hình ảnh" modalOk="Xong" modalCancel="Hủy">
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={handleUploadChange}
                    onPreview={handlePreview}
                    beforeUpload={() => false}
                    maxCount={1}
                    accept="image/*"
                  >
                    {/* === CẢI TIẾN GIAO DIỆN === */}
                    {fileList.length === 0 && (
                      <div>
                        <PlusOutlined />
                      </div>
                    )}
                    {/* === KẾT THÚC CẢI TIẾN === */}
                  </Upload>
                </ImgCrop>
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={14} lg={15}>
            <Card size="small" className="mb-4" title={<Space><AppstoreOutlined />Thông tin</Space>}>
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

              <Form.Item name="description" label="Mô tả" className="mb-2">
                <Input.TextArea
                  rows={2}
                  placeholder="Nhập mô tả về danh mục..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item name="isActive" label="Trạng thái" valuePropName="checked" className="mb-0">
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Vô hiệu" />
              </Form.Item>
            </Card>
          </Col>
        </Row>

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

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
      >
        <img alt="category-image-preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </Modal>
  );
};

export default CategoryFormModal;