import React from 'react';
import { Modal, Form, Input } from 'antd';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (banReason: string) => void;
}

const UserBanReasonModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values.banReason.trim());
      form.resetFields();
    } catch (e) {
      // validation failed
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Lý do khóa tài khoản"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Khóa"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" initialValues={{ banReason: '' }}>
        <Form.Item
          name="banReason"
          label="Lý do"
          rules={[{ required: true, message: 'Vui lòng nhập lý do khóa tài khoản' }]}
        >
          <Input.TextArea rows={4} placeholder="Nhập lý do khóa (ví dụ: vi phạm chính sách)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserBanReasonModal;
