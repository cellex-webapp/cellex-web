import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Input, Select, Upload, Button, Space, Typography, Image, Divider, Row, Col, DatePicker } from 'antd';
import { UploadOutlined, NotificationOutlined } from '@ant-design/icons';
import { useNotification } from '@/hooks/useNotification';
import dayjs, { Dayjs } from 'dayjs';

const { Text } = Typography;

const TYPE_LABELS: Record<NotificationType, string> = {
  SYSTEM: 'Hệ thống',
  ORDER_CREATED: 'Đơn hàng mới',
  ORDER_CONFIRMED: 'Đơn đã xác nhận',
  ORDER_SHIPPING: 'Đang giao hàng',
  ORDER_DELIVERED: 'Giao thành công',
  ORDER_CANCELLED: 'Đơn hàng hủy',
  PAYMENT_SUCCESS: 'Thanh toán thành công',
  PAYMENT_FAILED: 'Thanh toán thất bại',
  COUPON_AVAILABLE: 'Có mã giảm giá',
  PROMOTION: 'Chương trình khuyến mãi',
  PRODUCT_RESTOCK: 'Hàng đã về',
  REVIEW_REQUEST: 'Yêu cầu đánh giá',
  CUSTOM: 'Tùy chỉnh (Khác)',
};

const NotificationTypeOptions = Object.entries(TYPE_LABELS).map(([value, label]) => ({
  value,
  label: `${label}`, 
}));

type Props = {
  open: boolean;
  onClose: () => void;
};

const BroadcastModal: React.FC<Props> = ({ open, onClose }) => {
  const { sendBroadcast, isLoading } = useNotification();
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(undefined);
  }, [imageFile]);

  const initialType = useMemo(() => 'SYSTEM', []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      let metadataStr: string | undefined;
      const metaList: Array<{ key: string; value: string }> | undefined = values.metadataList;
      if (Array.isArray(metaList) && metaList.length > 0) {
        const obj: Record<string, string> = {};
        metaList.forEach((m) => {
          if (m?.key) obj[m.key] = m?.value ?? '';
        });
        try {
          metadataStr = JSON.stringify(obj);
        } catch {
          metadataStr = undefined;
        }
      }

      const expiresAtIso: string | undefined = values.expiresAt ? (values.expiresAt as Dayjs).toDate().toISOString() : undefined;

      const payload: BroadcastNotificationRequest = {
        title: values.title,
        message: values.message,
        type: values.type,
        metadata: metadataStr,
        actionUrl: values.actionUrl || undefined,
        expiresAt: expiresAtIso,
        imageFile,
      };
      await sendBroadcast(payload);
      form.resetFields();
      setImageFile(undefined);
      onClose();
    } catch (e) {
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <NotificationOutlined />
          <span>Gửi Thông báo Broadcast</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" loading={isLoading} onClick={handleSubmit}>Gửi</Button>
        </div>
      }
      width={720}
      style={{ top: 20 }}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ type: initialType }}
        validateTrigger="onChange"
        onValuesChange={(changed) => {
          const names = Object.keys(changed);
          names.forEach((n) => form.validateFields([n]).catch(() => {}));
        }}
      >
        <Divider orientation="left">Thông tin nội dung</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[
                { required: true, message: 'Nhập tiêu đề' },
                {
                  validator: (_, value) => {
                    if (typeof value === 'string' && value.trim().length > 0) return Promise.resolve();
                    return Promise.reject(new Error('Nhập tiêu đề'));
                  }
                },
              ]}
            >
              <Input maxLength={120} placeholder="VD: Khuyến mãi mùa hè" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="type" 
              label="Loại thông báo" 
              rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
            > 
              <Select 
                options={NotificationTypeOptions} 
                allowClear 
                showSearch 
                placeholder="Chọn loại sự kiện"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              /> 
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="message"
          label="Nội dung chi tiết"
          rules={[
            { required: true, message: 'Nhập nội dung' },
            {
              validator: (_, value) => {
                if (typeof value === 'string' && value.trim().length > 0) return Promise.resolve();
                return Promise.reject(new Error('Nhập nội dung'));
              }
            },
          ]}
        >
          <Input.TextArea rows={4} maxLength={500} showCount placeholder="Nội dung thông báo gửi đến người dùng..." />
        </Form.Item>

        <Divider orientation="left">Tùy chọn nâng cao</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="actionUrl" label="Action URL (Deep Link)" rules={[{ type: 'url', message: 'URL không hợp lệ' }]}>
              <Input placeholder="https://... hoặc app://..." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="expiresAt" label="Thời gian hết hạn">
              <DatePicker
                className="w-full"
                showTime
                format="YYYY-MM-DD HH:mm"
                placeholder="Chọn ngày giờ"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.List name="metadataList">
          {(fields, { add, remove }) => (
            <div className="bg-gray-50 p-3 rounded-md border border-dashed border-gray-300">
              <div className="flex items-center justify-between mb-2">
                <Text strong type="secondary">Dữ liệu đi kèm (Metadata)</Text>
                <Button type="dashed" size="small" onClick={() => add({ key: '', value: '' })}>+ Thêm dữ liệu</Button>
              </div>
              <Space direction="vertical" className="w-full">
                {fields.map((field) => (
                  <Row key={field.key} gutter={8} align="middle">
                    <Col span={10}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'key']}
                        fieldKey={[field.fieldKey!, 'key']}
                        rules={[{ required: true, message: 'Nhập Key' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="Key (vd: order_id)" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'value']}
                        fieldKey={[field.fieldKey!, 'value']}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="Value (vd: 12345)" />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                        <Button danger type="text" icon={<span className="text-lg">×</span>} onClick={() => remove(field.name)} />
                    </Col>
                  </Row>
                ))}
                {fields.length === 0 && <Text type="secondary" className="text-xs">Chưa có metadata nào.</Text>}
              </Space>
            </div>
          )}
        </Form.List>

        <Divider orientation="left">Hình ảnh đính kèm</Divider>
        <Form.Item label="Ảnh minh họa">
          <Space direction="vertical" className="w-full">
            <Upload
              beforeUpload={(file) => { setImageFile(file); return false; }}
              maxCount={1}
              fileList={imageFile ? [{ uid: '1', name: imageFile.name, originFileObj: imageFile } as any] : []}
              onRemove={() => setImageFile(undefined)}
              listType="picture"
              className="w-full"
            >
              <Button icon={<UploadOutlined />} block>Bấm để tải ảnh lên</Button>
            </Upload>
            
            {previewUrl && (
              <div className="mt-2 text-center border p-2 rounded bg-gray-50">
                <Image 
                  src={previewUrl} 
                  height={150} 
                  className="object-contain rounded" 
                  alt="preview" 
                />
              </div>
            )}
            {!previewUrl && <Text type="secondary" className="text-xs block text-center">(Hỗ trợ JPG, PNG. Tối đa 2MB)</Text>}
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BroadcastModal;