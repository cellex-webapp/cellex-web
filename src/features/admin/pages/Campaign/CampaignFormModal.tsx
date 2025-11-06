import React, { useEffect } from 'react';
// 1. Import thêm Divider và AppstoreAddOutlined
import { Modal, Form, Input, Select, InputNumber, DatePicker, Switch, message, Row, Col, Space, Divider } from 'antd';
import { AppstoreAddOutlined } from '@ant-design/icons';
import { useCoupon } from '@/hooks/useCoupon';
import dayjs from 'dayjs';

interface Props {
    open: boolean;
    onClose: () => void;
    editingCampaign: CouponCampaignResponse | null;
}

const { Option } = Select;
const { RangePicker } = DatePicker;

const CampaignFormModal: React.FC<Props> = ({ open, onClose, editingCampaign }) => {
    const [form] = Form.useForm();
    const { createCampaign, updateCampaign, isLoading } = useCoupon();
    const distributionType = Form.useWatch('distributionType', form);

    useEffect(() => {
        if (open) {
            if (editingCampaign) {
                form.setFieldsValue({
                    ...editingCampaign,
                    dateRange: [dayjs(editingCampaign.startDate), dayjs(editingCampaign.endDate)],
                    scheduledAt: editingCampaign.scheduledAt ? dayjs(editingCampaign.scheduledAt) : null,
                });
            } else {
                form.resetFields();
                form.setFieldsValue({
                    distributionType: 'SHARED_CODE',
                    couponType: 'PERCENTAGE',
                    perUserLimit: 1
                });
            }
        }
    }, [open, editingCampaign, form]);

    const handleSubmit = async (values: any) => {
        const { dateRange, scheduledAt, ...rest } = values;

        const payload: CreateCampaignRequest = {
            ...rest,
            startDate: dateRange[0].toISOString(),
            endDate: dateRange[1].toISOString(),
            scheduledAt: scheduledAt ? scheduledAt.toISOString() : null,
        };

        try {
            if (editingCampaign) {
                await updateCampaign(editingCampaign.id, payload).unwrap();
                message.success('Cập nhật campaign thành công');
            } else {
                await createCampaign(payload).unwrap();
                message.success('Tạo campaign thành công');
            }
            onClose();
        } catch (e) {
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={isLoading}
            // 2. Cải thiện Tiêu đề
            title={
                <Space>
                    <AppstoreAddOutlined style={{ color: '#1890ff' }} />
                    <span className="font-semibold">
                        {editingCampaign ? 'Cập nhật Campaign' : 'Tạo Campaign Mới'}
                    </span>
                </Space>
            }
            width={800}
            // 3. Thay 'centered' bằng 'style' để cuộn tốt hơn
            style={{ top: 20 }}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>

                {/* 4. Thêm nhóm Thông tin cơ bản */}
                <Divider orientation="left" plain>Thông tin cơ bản</Divider>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
                            {/* 5. Thêm showCount */}
                            <Input placeholder="VD: Flash Sale 12.12" showCount maxLength={100} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="distributionType" label="Loại phân phát" rules={[{ required: true }]}>
                            <Select>
                                <Option value="SHARED_CODE">Shared Code (Dùng chung)</Option>
                                <Option value="UNIQUE_PER_USER">Unique Code (Mỗi người 1 code)</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        {distributionType === 'SHARED_CODE' && (
                            <Form.Item name="codeTemplate" label="Mã Code (Chung)" rules={[{ required: true, message: 'Nhập mã code dùng chung' }]}>
                                <Input placeholder="VD: SALE1212" />
                            </Form.Item>
                        )}
                    </Col>
                </Row>

                {/* 4. Thêm nhóm Giá trị khuyến mãi */}
                <Divider orientation="left" plain>Giá trị khuyến mãi</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="couponType" label="Loại giảm giá" rules={[{ required: true }]}>
                            <Select>
                                <Option value="PERCENTAGE">Phần trăm (%)</Option>
                                <Option value="FIXED">Số tiền cố định (₫)</Option>
                                <Option value="FREE_SHIPPING">Miễn phí vận chuyển</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="discountValue" label="Giá trị giảm" rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="minOrderAmount" label="Đơn hàng tối thiểu (₫)">
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="maxDiscountAmount" label="Giảm tối đa (₫)">
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Col>
                </Row>

                {/* 4. Thêm nhóm Thời gian & Giới hạn */}
                <Divider orientation="left" plain>Thời gian & Giới hạn</Divider>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="dateRange" label="Thời gian hiệu lực" rules={[{ required: true }]}>
                            <RangePicker showTime style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="maxTotalIssuance" label="Tổng lượt phát tối đa">
                            <InputNumber style={{ width: '100%' }} min={1} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="perUserLimit" label="Lượt dùng / Người" rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} min={1} />
                        </Form.Item>
                    </Col>
                    {/* 6. Chuyển 'Lên lịch' sang span 24 cho cân đối */}
                    <Col span={24}>
                        <Form.Item name="scheduledAt" label="Lên lịch phát (Tùy chọn)">
                            <DatePicker showTime style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default CampaignFormModal;