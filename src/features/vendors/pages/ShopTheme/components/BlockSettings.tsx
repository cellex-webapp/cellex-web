import React, { useEffect, useCallback, useState } from 'react';
import {
  App, Button, Divider, Form, Input, InputNumber, Spin, Typography, Upload,
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload';
import uploadService from '@/services/upload.service';
import type { CanvasBlock } from '../ShopThemeBuilderPage';

const { Title, Text } = Typography;

interface BlockSettingsProps {
  block: CanvasBlock;
  onUpdateBlockData: (blockId: string, data: Record<string, any>) => void;
  onBack: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  banner: 'Banner',
  grid: 'Lưới sản phẩm',
  video: 'Video',
  text: 'Văn bản',
  list: 'Danh sách',
  cta: 'Nút kêu gọi',
};

const BlockSettings: React.FC<BlockSettingsProps> = ({
  block,
  onUpdateBlockData,
  onBack,
}) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);

  // Load block data into form whenever selected block changes
  useEffect(() => {
    form.setFieldsValue({
      imageUrl: block.data?.imageUrl ?? '',
      linkUrl: block.data?.linkUrl ?? '',
      title: block.data?.title ?? block.label,
      displayCount: block.data?.displayCount ?? 4,
    });
  }, [block.id, block.data, block.label, form]);

  const handleValuesChange = useCallback(
    (_changed: any, allValues: Record<string, any>) => {
      onUpdateBlockData(block.id, { ...allValues });
    },
    [block.id, onUpdateBlockData]
  );

  const customUpload = useCallback(
    async (options: any) => {
      const { file, onSuccess, onError } = options;
      setUploading(true);
      try {
        const resp = await uploadService.upload(file as RcFile, 'shop-theme');
        const url = resp.result;
        form.setFieldValue('imageUrl', url);
        onUpdateBlockData(block.id, {
          ...form.getFieldsValue(),
          imageUrl: url,
        });
        onSuccess(resp, file);
        message.success('Tải ảnh lên thành công');
      } catch (err: any) {
        const msg = err?.message ?? 'Tải ảnh thất bại';
        onError(new Error(msg));
        message.error(msg);
      } finally {
        setUploading(false);
      }
    },
    [form, block.id, onUpdateBlockData, message]
  );

  const typeLabel = TYPE_LABELS[block.type] ?? block.type;
  const imageUrl = block.data?.imageUrl as string | undefined;

  return (
    <div className="w-[320px] h-full bg-white border-l border-gray-200 p-4 overflow-y-auto shrink-0">
      {/* Back button */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        className="!pl-0 !text-indigo-600 !mb-3"
      >
        Quay lại Cài đặt chung
      </Button>

      <Title level={5} className="!mb-1">
        <SettingOutlined className="mr-2" />
        {typeLabel}
      </Title>
      <Text type="secondary" className="text-xs block mb-3">
        ID: {block.id}
      </Text>
      <Divider className="!my-2" />

      <Form
        form={form}
        layout="vertical"
        size="small"
        onValuesChange={handleValuesChange}
        initialValues={{
          imageUrl: block.data?.imageUrl ?? '',
          linkUrl: block.data?.linkUrl ?? '',
          title: block.data?.title ?? block.label,
          displayCount: block.data?.displayCount ?? 4,
        }}
      >
        {/* ---- Banner fields ---- */}
        {block.type === 'banner' && (
          <>
            <Form.Item className="mb-3">
              <Upload
                name="file"
                listType="picture-card"
                showUploadList={false}
                customRequest={customUpload}
                accept="image/*"
                maxCount={1}
              >
                {imageUrl ? (
                  <Spin spinning={uploading}>
                    <img
                      src={imageUrl}
                      alt="Banner preview"
                      className="w-full h-full object-cover rounded"
                    />
                  </Spin>
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <PlusOutlined className="text-lg mb-1" />
                    <span className="text-xs">{uploading ? 'Đang tải...' : 'Tải lên'}</span>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item name="linkUrl" label="Đường dẫn khi click vào ảnh">
              <Input placeholder="VD: /products, https://..." allowClear />
            </Form.Item>
          </>
        )}

        {/* ---- Grid fields ---- */}
        {block.type === 'grid' && (
          <>
            <Form.Item name="title" label="Tiêu đề danh sách">
              <Input placeholder="VD: Sản phẩm nổi bật" allowClear />
            </Form.Item>

            <Form.Item name="displayCount" label="Số lượng hiển thị">
              <InputNumber min={1} max={12} className="w-full" placeholder="4" />
            </Form.Item>
          </>
        )}

        {/* ---- Fallback for types without custom settings ---- */}
        {block.type !== 'banner' && block.type !== 'grid' && (
          <Text type="secondary" className="text-sm">
            Loại khối này chưa có thiết lập riêng.
          </Text>
        )}
      </Form>
    </div>
  );
};

export default BlockSettings;
