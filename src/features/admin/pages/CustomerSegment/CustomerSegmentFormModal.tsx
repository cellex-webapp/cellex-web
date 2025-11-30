import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, message, Space, InputNumber, Row, Col } from 'antd';
import { UsergroupAddOutlined } from '@ant-design/icons';
import { useCustomerSegment } from '@/hooks/useCustomerSegment';

interface Props {
  open: boolean;
  onClose: () => void;
  editingSegment: CustomerSegmentResponse | null;
}

const CustomerSegmentFormModal: React.FC<Props> = ({ open, onClose, editingSegment }) => {
  const [form] = Form.useForm();
  const { createSegment, updateSegment, isLoading } = useCustomerSegment();

  useEffect(() => {
    if (open) {
      if (editingSegment) {
        form.setFieldsValue({
          ...editingSegment,
          maxSpend: editingSegment.maxSpend ?? undefined,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editingSegment, form]);

  const handleSubmit = async (values: any) => {
    const payload: CreateCustomerSegmentRequest = {
      ...values,
      maxSpend: values.maxSpend ?? null,
    };
    
    try {
      if (editingSegment) {
        await updateSegment(editingSegment.id, payload).unwrap();
        message.success('Cập nhật phân khúc thành công');
      } else {
        await createSegment(payload).unwrap();
        message.success('Tạo phân khúc thành công');
      }
      onClose();
    } catch (err: any) {
      message.error(err.message || 'Thao tác thất bại');
    }
  };

  return (
    <Modal
      open={open}
      title={
        <Space>
          <UsergroupAddOutlined />
          {editingSegment ? 'Cập nhật Phân khúc' : 'Tạo Phân khúc Mới'}
        </Space>
      }
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose} disabled={isLoading}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" loading={isLoading} onClick={form.submit}>
          {editingSegment ? 'Cập nhật' : 'Tạo'}
        </Button>,
      ]}
      centered
      destroyOnClose
      width={700}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item 
              name="name" 
              label="Tên phân khúc" 
              rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
            >
              <Input placeholder="VD: Khách hàng VIP, Khách mới" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="level"
              label="Cấp độ (Level)"
              rules={[{ required: true, message: 'Nhập cấp độ (số)' }]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="VD: 1, 2, 3" min={1} />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item 
          name="description" 
          label="Mô tả"
        >
          <Input.TextArea rows={3} placeholder="Mô tả mục đích của phân khúc này..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="minSpend"
              label="Chi tiêu tối thiểu (VND)"
              rules={[{ required: true, message: 'Nhập số tiền tối thiểu' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} step={100000} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maxSpend"
              label="Chi tiêu tối đa (VND)"
              tooltip="Để trống nếu không có giới hạn trên (VD: Khách VIP)"
            >
              <InputNumber style={{ width: '100%' }} min={0} step={100000} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CustomerSegmentFormModal;