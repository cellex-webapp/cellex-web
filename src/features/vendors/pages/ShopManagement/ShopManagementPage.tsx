import React, { useEffect, useState } from 'react';
import { Card, Button, Spin, Typography, Avatar, Tag, Row, Col, Descriptions, App } from 'antd';
import { EditOutlined, ShopOutlined } from '@ant-design/icons';
import useShop from '@/hooks/useShop';
import ShopFormModal from './ShopFormModal';

const { Title, Text } = Typography;

const ShopManagementPageContent: React.FC = () => {
    const { shop, isLoading, fetchMyShop } = useShop();
    const [isModalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchMyShop();
    }, [fetchMyShop]);

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    const handleModalSuccess = () => {
        fetchMyShop();
        closeModal();
    };

    const formatDate = (s?: string) => (s ? new Date(s).toLocaleString('vi-VN') : '-');

    const statusConfig = {
        PENDING: { color: 'orange', text: 'Chờ duyệt' },
        APPROVED: { color: 'green', text: 'Đã duyệt' },
        REJECTED: { color: 'red', text: 'Bị từ chối' },
        BANNED: { color: 'red', text: 'Đã bị cấm' },
    };

    return (
        <div style={{ maxWidth: 980, margin: '24px auto' }}>
            <Card
                title={<Title level={4} style={{ margin: 0 }}><ShopOutlined /> Quản lý cửa hàng</Title>}
                className="shadow-sm"
                extra={(
                    <Button
                        type="primary"
                        onClick={openModal}
                        icon={<EditOutlined />}
                        className="!bg-indigo-600"
                    >
                        {shop ? 'Cập nhật thông tin' : 'Đăng ký cửa hàng'}
                    </Button>
                )}
            >
                {isLoading && !shop ? (
                    <div className="p-10 text-center"><Spin size="large" /></div>
                ) : shop ? (
                    <Row gutter={[24, 16]} align="top">
                        <Col xs={24} sm={8} md={6} className="text-center">
                            <Avatar size={120} src={shop.logo_url} shape="square" />
                        </Col>
                        <Col xs={24} sm={16} md={18}>
                            <Title level={3} style={{ marginTop: 0, marginBottom: 8 }}>{shop.shop_name}</Title>
                            <div className="mb-4">
                                <Tag color={statusConfig[shop.status]?.color || 'default'}>
                                    {statusConfig[shop.status]?.text || shop.status}
                                </Tag>
                                <Text type="secondary" style={{ marginLeft: 8 }}>Đánh giá: {shop.rating?.toFixed(1) ?? '-'}</Text>
                            </div>
                            <Descriptions column={1} bordered size="small">
                                <Descriptions.Item label="Mô tả">{shop.description || '—'}</Descriptions.Item>
                                <Descriptions.Item label="Điện thoại">{shop.phone_number ?? '—'}</Descriptions.Item>
                                <Descriptions.Item label="Email">{shop.email ?? '—'}</Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ">{shop.address?.fullAddress ?? '—'}</Descriptions.Item>
                                <Descriptions.Item label="Ngày tham gia">{formatDate(shop.created_at)}</Descriptions.Item>
                                {shop.rejection_reason && (
                                    <Descriptions.Item label="Lý do từ chối">
                                        <Text type="danger">{shop.rejection_reason}</Text>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Col>
                    </Row>
                ) : (
                    <div className="p-10 text-center">
                        <Text type="secondary">Bạn chưa đăng ký cửa hàng.</Text>
                    </div>
                )}
            </Card>

            <ShopFormModal
                shop={shop}
                open={isModalOpen}
                onClose={closeModal}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
};

const ShopManagementPage: React.FC = () => (
    <App>
        <ShopManagementPageContent />
    </App>
);

export default ShopManagementPage;