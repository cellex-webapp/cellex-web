import React, { useEffect, useState } from 'react';
import { Modal, Card, Space, Descriptions, Spin, Tag, message, Empty, Row, Col } from 'antd';
import { AppstoreOutlined, PictureOutlined } from '@ant-design/icons';
import { categoryService } from '@/services/category.service';

interface Props {
  categoryId: string | null;
  open: boolean;
  onClose: () => void;
}

const CategoryDetailModal: React.FC<Props> = ({ categoryId, open, onClose }) => {
  const [category, setCategory] = useState<ICategory | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !categoryId) return;

    let mounted = true;
    const fetch = async () => {
      try {
        setLoading(true);
        const resp = await categoryService.getCategoryById(categoryId);
        if (mounted) {
          setCategory(resp.result ?? null);
        }
      } catch (err: any) {
        if (mounted) {
          message.error(err?.message ?? 'Không thể tải thông tin danh mục');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetch();

    return () => {
      mounted = false;
    };
  }, [open, categoryId]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-10">
          <Spin size="large" />
        </div>
      );
    }

    if (!category) {
      return (
        <div className="py-10">
          <Empty description="Không tìm thấy dữ liệu danh mục" />
        </div>
      );
    }
    return (
      <div>
        <Row gutter={16} className="mb-4">
          <Col span={10}>
            <Card
              size="small"
              title={<Space><PictureOutlined />Hình ảnh danh mục</Space>}
            >
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  style={{
                    width: '100%',
                    maxHeight: 250,
                    objectFit: 'contain',
                    borderRadius: '8px',
                    background: '#f8f8f8'
                  }}
                />
              ) : (
                <div style={{ minHeight: 150 }} className="flex items-center justify-center">
                  <Empty description="Không có hình ảnh" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              )}
            </Card>
          </Col>

          <Col span={14}>
            <Card
              size="small"
              title={<Space><AppstoreOutlined />Thông tin cơ bản</Space>}
            >
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Tên danh mục">{category.name}</Descriptions.Item>
                <Descriptions.Item label="Slug">{category.slug}</Descriptions.Item>
                <Descriptions.Item label="Mô tả">{category.description || '-'}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={category.isActive ? 'green' : 'red'}>
                    {category.isActive ? 'Hoạt động' : 'Vô hiệu'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        <Card
          size="small"
          title={<Space><AppstoreOutlined />Phân cấp danh mục</Space>}
        >
          <Descriptions column={1} bordered size="small" className="mb-0">
            <Descriptions.Item label="Danh mục cha">
              {category.parent ?? 'Danh mục gốc'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <span className="font-semibold">Chi tiết danh mục</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={650}
      centered
      destroyOnClose
    >
      {renderContent()}
    </Modal>
  );
};

export default CategoryDetailModal;