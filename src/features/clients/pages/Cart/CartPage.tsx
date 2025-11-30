import React, { useEffect, useState } from 'react';
import { Tag, App, Button, Card, Col, Descriptions, Divider, Empty, Image, InputNumber, List, Row, Spin, Statistic, Typography, message } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import orderService from '@/services/order.service';

const { Title, Text } = Typography;

const CartPageContent: React.FC = () => {
    const { modal } = App.useApp();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const { items, isLoading, totalItems, totalPrice, fetchMyCart, setQuantity, removeFromCart, clearCart } = useCart();

    const [tempQuantities, setTempQuantities] = useState<Record<string, number>>({});

    useEffect(() => {
        if (currentUser) {
            fetchMyCart();
        }
    }, [currentUser, fetchMyCart]);

    useEffect(() => {
        const newTemps: Record<string, number> = {};
        items.forEach(item => {
            newTemps[item.productId] = item.quantity;
        });
        setTempQuantities(newTemps);
    }, [items]);

    const handleQuantityChange = (productId: string, value: number | null) => {
        const newQuantity = value === null ? 0 : value;
        setTempQuantities(prev => ({
            ...prev,
            [productId]: newQuantity,
        }));
    };

    const formatPrice = (value?: number) => {
        if (value == null || Number.isNaN(value)) return '—';
        try { return value.toLocaleString('vi-VN') + ' ₫'; } catch { return String(value); }
    };

    const handleQuantityBlur = async (productId: string, stockQuantity: number) => {
        let quantity = tempQuantities[productId];

        if (quantity === undefined || quantity < 0) {
            quantity = 0;
        }
        if (quantity > stockQuantity) {
            message.error(`Số lượng tồn kho chỉ còn ${stockQuantity} sản phẩm.`);
            quantity = stockQuantity;
        }

        setTempQuantities(prev => ({ ...prev, [productId]: quantity }));

        try {
            await setQuantity({ productId, quantity }).unwrap();
            if (quantity === 0) {
                message.success('Đã xóa sản phẩm khỏi giỏ hàng');
            } else {
                message.success('Cập nhật số lượng thành công');
            }
        } catch (err) {
            const originalItem = items.find(i => i.productId === productId);
            setTempQuantities(prev => ({ ...prev, [productId]: originalItem?.quantity ?? 1 }));
        }
    };

    const handleRemoveItem = (productId: string) => {
        modal.confirm({
            title: 'Xóa sản phẩm?',
            centered: true,
            content: 'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await removeFromCart({ productIds: [productId] }).unwrap();
                    message.success('Đã xóa sản phẩm');
                } catch (err) {
                }
            },
        });
    };

    const handleClearAll = () => {
        modal.confirm({
            title: 'Xóa toàn bộ giỏ hàng?',
            centered: true,
            content: 'Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?',
            okText: 'Xóa tất cả',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await clearCart().unwrap();
                    message.success('Đã làm trống giỏ hàng');
                } catch (err) {
                }
            },
        });
    };

    if (isLoading && items.length === 0) {
        return <div className="flex justify-center items-center h-96"><Spin size="large" /></div>;
    }

    if (!currentUser) {
        return <div className="p-10 text-center">
            <Empty description="Vui lòng đăng nhập để xem giỏ hàng" />
            <Button type="primary" onClick={() => navigate('/login')}>Đăng nhập</Button>
        </div>;
    }

    if (items.length === 0) {
        return <div className="p-10 text-center gap-4 flex flex-col items-center">
            <Empty description="Giỏ hàng của bạn đang trống" />
            <Button type="primary" className='!bg-indigo-600' onClick={() => navigate('/')}>Tiếp tục mua sắm</Button>
        </div>;
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <Title level={2} className="mb-6">Giỏ hàng</Title>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card
                        className="shadow-sm"
                        title={<Title level={4} style={{ margin: 0 }}>Giỏ hàng của bạn ({totalItems} sản phẩm)</Title>}
                        extra={
                            <Button type="text" danger onClick={handleClearAll} disabled={isLoading}>
                                Xóa tất cả
                            </Button>
                        }
                    >
                        <List
                            dataSource={items}
                            loading={isLoading}
                            renderItem={(item) => {
                                const unitPrice = item.price ?? 0;
                                const availableStock = item.availableStock ?? 0;
                                return (
                                    <List.Item>
                                        <Row gutter={16} align="middle" className="w-full flex-nowrap">
                                            <Col span={3}>
                                                <Image
                                                    width="100%"
                                                    src={item.productImage}
                                                    style={{ objectFit: 'cover', borderRadius: '4px', aspectRatio: '1 / 1' }}
                                                />
                                            </Col>

                                            <Col flex={1} className="min-w-0">
                                                <Text strong className="line-clamp-2 mb-1">{item.productName}</Text>
                                                <div className="mt-1">
                                                    <Text type="secondary" style={{ fontSize: 12 }}>Tồn kho: {availableStock}</Text>
                                                    {!item.isAvailable && <Tag color="red" className="ml-2">Ngừng kinh doanh</Tag>}
                                                </div>
                                            </Col>

                                            <Col span={5} className="text-right">
                                                <Statistic
                                                    value={formatPrice(unitPrice)}
                                                    style={{ whiteSpace: 'nowrap' }}
                                                    valueStyle={{ color: '#cf1322', fontSize: '1.1rem', fontWeight: 500 }}
                                                />
                                            </Col>

                                            <Col span={5} className="flex justify-center">
                                                <InputNumber
                                                    min={0}
                                                    max={availableStock}
                                                    value={tempQuantities[item.productId]}
                                                    onChange={(value) => handleQuantityChange(item.productId, value)}
                                                    onBlur={() => handleQuantityBlur(item.productId, availableStock)}
                                                    onPressEnter={() => handleQuantityBlur(item.productId, availableStock)}
                                                    style={{ width: 80 }}
                                                    disabled={isLoading}
                                                />
                                            </Col>

                                            <Col span={3} className="text-right">
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => handleRemoveItem(item.productId)}
                                                />
                                            </Col>
                                        </Row>
                                    </List.Item>
                                );
                            }}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title={<Title level={4} style={{ margin: 0 }}>Tóm tắt đơn hàng</Title>} className="shadow-sm">
                        <Descriptions column={1} layout="horizontal" colon={false}>
                            <Descriptions.Item label="Tổng số sản phẩm">
                                <Text strong>{totalItems}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Phí vận chuyển">
                                <Text strong type="success">Miễn phí</Text>
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider />
                        <Statistic
                            title={<Text strong style={{ fontSize: 16 }}>Tổng cộng</Text>}
                            value={totalPrice}
                            precision={0}
                            suffix="₫"
                            valueStyle={{ color: '#cf1322', fontSize: '2.2rem' }}
                        />
                        <Divider />
                        <Button
                            type="primary"
                            size="large"
                            block
                            className="!bg-indigo-600"
                            icon={<ShoppingCartOutlined />}
                            disabled={isLoading || items.length === 0}
                            onClick={async () => {
                                try {
                                    const resp = await orderService.createOrderFromCart({ items: items.map(i => ({ productId: i.productId, quantity: i.quantity })) });
                                    const order = resp.result as IOrder;
                                    if (order?.id) {
                                        message.success('Tạo đơn hàng thành công');
                                        navigate(`/order/confirm/${order.id}`);
                                    } else {
                                        message.error('Không tạo được đơn hàng');
                                    }
                                } catch (e: any) {
                                    message.error(e?.message || 'Lỗi tạo đơn hàng');
                                }
                            }}
                        >
                            Tiến hành thanh toán
                        </Button>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

const CartPage: React.FC = () => (
    <App>
        <CartPageContent />
    </App>
);

export default CartPage;