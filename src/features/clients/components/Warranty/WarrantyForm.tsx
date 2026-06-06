import React, { useState } from 'react';
import { Form, Input, Button, Alert, Upload, Space, Image, message, Skeleton } from 'antd';
import { SafetyCertificateOutlined, UploadOutlined } from '@ant-design/icons';
import uploadService from '@/services/upload.service';

interface WarrantyFormProps {
  orderItemId: string;
  productName: string;
  onSubmit: (data: ICreateWarrantyClaimRequest) => Promise<void>;
  onCancel: () => void;
}

export const WarrantyForm: React.FC<WarrantyFormProps> = ({ orderItemId, productName, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string; status: 'uploading' | 'done' | 'error'; url?: string }>>([]);

  const handleRemoveUrl = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleCustomUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const name = (file && file.name) || 'file';

    // add placeholder entry with uploading status
    setUploadedFiles(prev => [...prev, { id, name, status: 'uploading' }]);

    try {
      const resp = await uploadService.upload(file as File, 'warranty');
      const url = resp.result;
      setUploadedFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'done', url } : f));
      onSuccess?.(null, file);
    } catch (err) {
      setUploadedFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'error' } : f));
      onError?.(err);
      message.error('Tải lên thất bại');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      const urls = uploadedFiles.filter(f => f.status === 'done' && f.url).map(f => f.url) as string[];
      await onSubmit({
        orderItemId,
        issueDescription: values.issueDescription,
        images: JSON.stringify(urls || []),
      });
      form.resetFields();
      setUploadedFiles([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Alert
        message={`Yêu cầu bảo hành cho: ${productName}`}
        type="info"
        showIcon
        icon={<SafetyCertificateOutlined />}
        className="mb-4"
      />
      
      <Form.Item
        name="issueDescription"
        label="Mô tả tình trạng lỗi"
        rules={[
          { required: true, message: 'Vui lòng mô tả chi tiết lỗi bạn đang gặp phải' },
          { min: 10, message: 'Vui lòng mô tả chi tiết hơn (ít nhất 10 ký tự)' }
        ]}
      >
        <Input.TextArea 
          rows={4} 
          placeholder="Ví dụ: Sản phẩm không lên nguồn, màn hình bị sọc sau 2 tuần sử dụng..." 
        />
      </Form.Item>

      <Form.Item label="Hình ảnh / Video minh họa (Tùy chọn)">
        <Upload
          customRequest={handleCustomUpload}
          multiple
          showUploadList={false}
          accept="image/*,video/*"
        >
          <Button icon={<UploadOutlined />}>Chọn ảnh hoặc video</Button>
        </Upload>

        {uploadedFiles.length > 0 && (
          <Space direction="vertical" size="small" className="mt-3 w-full">
            {uploadedFiles.map((f) => (
              <div key={f.id} className="flex items-center gap-3">
                {f.status === 'uploading' ? (
                  <Skeleton.Avatar active size={80} />
                ) : f.url ? (
                  <Image src={f.url} width={80} height={80} preview={{ src: f.url }} />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 flex items-center justify-center">?</div>
                )}

                <div className="flex-1">
                  <div className="truncate text-sm">{f.name}</div>
                  <div className="mt-1">
                    <Space>
                      {f.status === 'error' && <span className="text-red-500 text-sm">Tải lên thất bại</span>}
                      <Button size="small" danger onClick={() => handleRemoveUrl(f.id)}>Xóa</Button>
                    </Space>
                  </div>
                </div>
              </div>
            ))}
          </Space>
        )}
        {/* store uploaded urls via form submit */}
      </Form.Item>

      <div className="flex justify-end gap-2 mt-6">
        <Button onClick={onCancel} disabled={isSubmitting}>
          Hủy bỏ
        </Button>
        <Button type="primary" htmlType="submit" loading={isSubmitting} className="!bg-indigo-600">
          Gửi yêu cầu
        </Button>
      </div>
    </Form>
  );
};