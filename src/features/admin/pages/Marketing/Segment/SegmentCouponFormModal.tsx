import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch, Row, Col, Space, Divider, Button } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import { useCustomerSegment } from '@/hooks/useCustomerSegment';

interface Props {
  open: boolean;
  onClose: () => void;
  initial: SegmentCouponResponse | null;
  onSubmit: (values: CreateSegmentCouponRequest | UpdateSegmentCouponRequest) => Promise<any>;
  submitting?: boolean;
}

const { Option } = Select;

const SegmentCouponFormModal: React.FC<Props> = ({ open, onClose, initial, onSubmit, submitting }) => {
  const [form] = Form.useForm();
  const editing = Boolean(initial);

  useEffect(() => {
    if (open) {
      if (initial) {
        form.setFieldsValue({
          segmentId: initial.segmentId,
          codePrefix: initial.codePrefix,
          title: initial.title,
          description: initial.description ?? undefined,
          discountType: initial.discountType,
          discountValue: initial.discountValue,
          minOrderAmount: initial.minOrderAmount ?? undefined,
          validHours: initial.validHours ?? undefined,
          isActive: initial.isActive,
          isAutoOnUpgrade: initial.isAutoOnUpgrade,
          scheduleFrequency: initial.scheduleFrequency,
          scheduleDayOfWeek: initial.scheduleDayOfWeek ?? undefined,
          scheduleDayOfMonth: initial.scheduleDayOfMonth ?? undefined,
          scheduleMonthDay: initial.scheduleMonthDay ?? undefined,
          scheduleTime: initial.scheduleTime ?? undefined,
          maxUsesPerUser: initial.maxUsesPerUser ?? undefined,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ isActive: true, isAutoOnUpgrade: false, scheduleFrequency: 'NONE' });
      }
    }
  }, [open, initial, form]);

  const { segments, fetchAllSegments } = useCustomerSegment();
  useEffect(() => {
    if (open && segments.length === 0) fetchAllSegments();
  }, [open, segments.length, fetchAllSegments]);

  const freq = Form.useWatch('scheduleFrequency', form);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <Space>
          <GiftOutlined style={{ color: '#1890ff' }} />
          <span className="font-semibold">{editing ? 'Cập nhật Coupon' : 'Tạo Coupon Segment'}</span>
        </Space>
      }
      width={820}
      style={{ top: 20 }}
      destroyOnClose
      footer={null}
      centered
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Divider orientation="left" plain>Thông tin cơ bản</Divider>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="segmentId" label="Phân khúc" rules={[{ required: true, message: 'Chọn phân khúc' }]} tooltip="Coupon gắn với 1 Customer Segment">
              <Select placeholder="Chọn phân khúc" size="large">
                {segments.map((s) => (
                  <Option key={s.id} value={s.id}>{s.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="codePrefix" label="Mã tiền tố" rules={[{ required: true, message: 'Nhập mã tiền tố' }]}>
              <Input size="large" placeholder="VD: DAILY, WEEKEND, VIP" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
              <Input size="large" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" plain>Giá trị</Divider>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="discountType" label="Loại giảm" rules={[{ required: true }]}>
              <Select size="large">
                <Option value="FIXED">Cố định</Option>
                <Option value="PERCENTAGE">Phần trăm</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="discountValue" label="Giá trị giảm" rules={[{ required: true }]}>
              <InputNumber size="large" style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="minOrderAmount" label="Đơn tối thiểu (₫)">
              <InputNumber size="large" style={{ width: '100%' }} min={0} step={10000} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="validHours" label="Hiệu lực (giờ)">
              <InputNumber size="large" style={{ width: '100%' }} min={1} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" plain>Thiết lập</Divider>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isAutoOnUpgrade" label="Tự động khi nâng hạng" valuePropName="checked" initialValue={false}>
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" plain>Lịch phát</Divider>
        <Form.Item name="scheduleFrequency" label="Tần suất" rules={[{ required: true }]}>
          <Select size="large">
            <Option value="NONE">Không lịch</Option>
            <Option value="DAILY">Hàng ngày</Option>
            <Option value="WEEKLY">Hàng tuần</Option>
            <Option value="MONTHLY">Hàng tháng</Option>
            <Option value="YEARLY">Hàng năm</Option>
          </Select>
        </Form.Item>

        {freq === 'WEEKLY' && (
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="scheduleDayOfWeek" label="Thứ" rules={[{ required: true }]}>
                <Select size="large">
                  {['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'].map((d) => (
                    <Option key={d} value={d}>{d}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="scheduleTime" label="Giờ (HH:mm:ss)" rules={[{ required: true }]}>
                <Input size="large" placeholder="18:00:00" />
              </Form.Item>
            </Col>
          </Row>
        )}
        {freq === 'DAILY' && (
          <Form.Item name="scheduleTime" label="Giờ (HH:mm:ss)" rules={[{ required: true }]}>
            <Input size="large" placeholder="09:00:00" />
          </Form.Item>
        )}
        {freq === 'MONTHLY' && (
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="scheduleDayOfMonth" label="Ngày trong tháng (1-31)" rules={[{ required: true }]}>
                <InputNumber size="large" min={1} max={31} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="scheduleTime" label="Giờ (HH:mm:ss)" rules={[{ required: true }]}>
                <Input size="large" placeholder="00:00:00" />
              </Form.Item>
            </Col>
          </Row>
        )}
        {freq === 'YEARLY' && (
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="scheduleMonthDay" label="MM-DD" rules={[{ required: true }]}>
                <Input size="large" placeholder="01-01" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="scheduleTime" label="Giờ (HH:mm:ss)" rules={[{ required: true }]}>
                <Input size="large" placeholder="00:00:00" />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Divider />
        <Form.Item name="maxUsesPerUser" label="Số lần dùng / user (để trống = không giới hạn)">
          <InputNumber size="large" min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex justify-end gap-2">
            <Button size="large" onClick={onClose} disabled={submitting}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={submitting} size="large">
              {editing ? 'Cập nhật' : 'Lưu'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SegmentCouponFormModal;
