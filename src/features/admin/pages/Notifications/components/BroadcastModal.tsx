import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Input, Select, Upload, Button, Space, Typography, Image, Divider, Row, Col, DatePicker } from 'antd';
import { UploadOutlined, NotificationOutlined } from '@ant-design/icons';
import { useNotification } from '@/hooks/useNotification';
import dayjs, { Dayjs } from 'dayjs';

const { Text } = Typography;

const NotificationTypeOptions = [
  { value: 'GENERAL', label: 'Chung' },
  { value: 'SYSTEM', label: 'Hệ thống' },
  { value: 'PROMOTION', label: 'Khuyến mãi' },
];

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

  const initialType = useMemo(() => 'GENERAL', []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Transform metadata list to JSON string
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

      // Format expiresAt to ISO string
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
      // ignore
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
          // Revalidate only changed fields to clear previous errors promptly
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
                    return Promise.reject(new Error('Nhập tiêu đề'));}
                },
              ]}
            >
              <Input maxLength={120} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="type" label="Loại" rules={[{ required: true }]}> <Select options={NotificationTypeOptions} allowClear /> </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="message"
          label="Nội dung"
          rules={[
            { required: true, message: 'Nhập nội dung' },
            {
              validator: (_, value) => {
                if (typeof value === 'string' && value.trim().length > 0) return Promise.resolve();
                return Promise.reject(new Error('Nhập nội dung'));}
            },
          ]}
        >
          <Input.TextArea rows={4} maxLength={500} showCount />
        </Form.Item>

        <Divider orientation="left">Tùy chọn</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="actionUrl" label="Action URL" rules={[{ type: 'url', message: 'URL không hợp lệ' }]}>
              <Input placeholder="https://..." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="expiresAt" label="Hết hạn">
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
            <div>
              <div className="flex items-center justify-between">
                <Text strong>Metadata</Text>
                <Button type="dashed" onClick={() => add({ key: '', value: '' })}>Thêm dòng</Button>
              </div>
              <Space direction="vertical" className="mt-2 w-full">
                {fields.map((field) => (
                  <Row key={field.key} gutter={8} align="bottom">
                    <Col span={10}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'key']}
                        fieldKey={[field.fieldKey!, 'key']}
                        rules={[{ required: true, message: 'Nhập khóa' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="Khóa" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'value']}
                        fieldKey={[field.fieldKey!, 'value']}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="Giá trị" />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Form.Item style={{ marginBottom: 0 }}>
                        <Button danger className="w-full" onClick={() => remove(field.name)}>Xóa</Button>
                      </Form.Item>
                    </Col>
                  </Row>
                ))}
              </Space>
            </div>
          )}
        </Form.List>

        <Divider orientation="left">Hình ảnh đính kèm</Divider>
        <Form.Item label="Ảnh">
          <Space direction="vertical">
            <Upload
              beforeUpload={(file) => { setImageFile(file); return false; }}
              maxCount={1}
              fileList={imageFile ? [{ uid: '1', name: imageFile.name, originFileObj: imageFile } as any] : []}
              onRemove={() => setImageFile(undefined)}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
            {previewUrl && (
              <Image src={previewUrl} width={200} className="rounded" alt="preview" />
            )}
            {!previewUrl && <Text type="secondary">(Không bắt buộc)</Text>}
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BroadcastModal;