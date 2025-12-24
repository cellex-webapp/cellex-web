/**
 * Review Action Modal Component
 * 
 * Modal for admin actions (approve, reject, hide) with reason input.
 * Shows confirmation dialog before executing action.
 */

import React, { useState, useEffect } from 'react';
import { Modal, Input, Form, Alert, Typography, Space } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeInvisibleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

type ActionType = 'approve' | 'reject' | 'hide';

interface ActionConfig {
  title: string;
  icon: React.ReactNode;
  okText: string;
  okType: 'primary' | 'default' | 'danger';
  okClass?: string;
  description: string;
  reasonRequired: boolean;
  reasonPlaceholder: string;
}

const ACTION_CONFIG: Record<ActionType, ActionConfig> = {
  approve: {
    title: 'Duyệt đánh giá',
    icon: <CheckCircleOutlined className="text-green-500 text-2xl" />,
    okText: 'Duyệt',
    okType: 'primary',
    okClass: '!bg-green-500 hover:!bg-green-600',
    description: 'Đánh giá sẽ được hiển thị công khai trên trang sản phẩm.',
    reasonRequired: false,
    reasonPlaceholder: 'Nhập lý do duyệt (không bắt buộc)...',
  },
  reject: {
    title: 'Từ chối đánh giá',
    icon: <CloseCircleOutlined className="text-red-500 text-2xl" />,
    okText: 'Từ chối',
    okType: 'danger',
    description: 'Đánh giá sẽ bị từ chối và không hiển thị công khai. Người dùng sẽ nhận được thông báo.',
    reasonRequired: true,
    reasonPlaceholder: 'Nhập lý do từ chối (bắt buộc)...',
  },
  hide: {
    title: 'Ẩn đánh giá',
    icon: <EyeInvisibleOutlined className="text-gray-500 text-2xl" />,
    okText: 'Ẩn',
    okType: 'default',
    description: 'Đánh giá sẽ bị ẩn tạm thời. Có thể khôi phục lại sau.',
    reasonRequired: false,
    reasonPlaceholder: 'Nhập lý do ẩn (không bắt buộc)...',
  },
};

interface ReviewActionModalProps {
  open: boolean;
  action: ActionType | null;
  reviewId: string | null;
  reviewComment?: string;
  onCancel: () => void;
  onConfirm: (reviewId: string, action: ActionType, reason?: string) => Promise<boolean>;
  isLoading?: boolean;
}

/**
 * ReviewActionModal Component
 */
export const ReviewActionModal: React.FC<ReviewActionModalProps> = ({
  open,
  action,
  reviewId,
  reviewComment,
  onCancel,
  onConfirm,
  isLoading = false,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal opens/closes or action changes
  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, action, form]);

  if (!action || !reviewId) return null;

  const config = ACTION_CONFIG[action];

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      const success = await onConfirm(reviewId, action, values.reason);
      
      if (success) {
        form.resetFields();
        onCancel();
      }
    } catch (error) {
      // Form validation failed
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          {config.icon}
          <span>{config.title}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={config.okText}
      okType={config.okType}
      okButtonProps={{
        loading: submitting || isLoading,
        className: config.okClass,
      }}
      cancelText="Hủy"
      confirmLoading={submitting || isLoading}
      maskClosable={false}
      destroyOnClose
    >
      <div className="py-4 space-y-4">
        {/* Description */}
        <Alert
          type={action === 'approve' ? 'success' : action === 'reject' ? 'error' : 'warning'}
          message={config.description}
          showIcon
          icon={<ExclamationCircleOutlined />}
        />

        {/* Review Preview */}
        {reviewComment && (
          <div className="bg-gray-50 rounded-lg p-3">
            <Text type="secondary" className="text-xs block mb-1">
              Nội dung đánh giá:
            </Text>
            <Text className="line-clamp-3 text-sm">
              {reviewComment.length > 200 
                ? `${reviewComment.substring(0, 200)}...` 
                : reviewComment
              }
            </Text>
          </div>
        )}

        {/* Reason Input */}
        <Form form={form} layout="vertical">
          <Form.Item
            name="reason"
            label={
              <Space>
                <span>Lý do</span>
                {config.reasonRequired && (
                  <Text type="danger" className="text-xs">*Bắt buộc</Text>
                )}
              </Space>
            }
            rules={[
              {
                required: config.reasonRequired,
                message: 'Vui lòng nhập lý do',
              },
              {
                max: 500,
                message: 'Lý do không được quá 500 ký tự',
              },
            ]}
          >
            <TextArea
              placeholder={config.reasonPlaceholder}
              rows={4}
              maxLength={500}
              showCount
              autoFocus={config.reasonRequired}
            />
          </Form.Item>
        </Form>

        {/* Warning for reject action */}
        {action === 'reject' && (
          <Alert
            type="warning"
            message="Lưu ý: Người dùng sẽ nhận được thông báo về việc đánh giá bị từ chối kèm theo lý do bạn cung cấp."
            showIcon
            className="!bg-yellow-50 !border-yellow-200"
          />
        )}
      </div>
    </Modal>
  );
};

/**
 * Confirmation dialog for quick actions (without reason)
 */
export const confirmReviewAction = (
  action: ActionType,
  onConfirm: () => Promise<void>
): void => {
  const config = ACTION_CONFIG[action];
  
  Modal.confirm({
    title: config.title,
    icon: config.icon,
    content: config.description,
    okText: config.okText,
    okType: config.okType as any,
    cancelText: 'Hủy',
    onOk: onConfirm,
  });
};

export default ReviewActionModal;
