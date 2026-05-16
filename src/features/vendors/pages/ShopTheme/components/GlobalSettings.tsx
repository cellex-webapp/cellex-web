import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Button, ColorPicker, Divider, Form, Popconfirm,
  Select, Switch, Tag, Typography,
} from 'antd';
import {
  BgColorsOutlined, DeleteOutlined, FontSizeOutlined,
  SaveOutlined, UndoOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Lato', value: 'Lato' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Nunito', value: 'Nunito' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Merriweather', value: 'Merriweather' },
  { label: 'Be Vietnam Pro', value: 'Be Vietnam Pro' },
];

interface GlobalSettingsProps {
  theme: ITheme | null;
  isLoading: boolean;
  onSave: (payload: ICreateThemePayload) => Promise<void>;
  onDelete: () => Promise<void>;
}

const toHex = (val: any): string => {
  if (typeof val === 'string') return val;
  return val?.toHexString?.() ?? '#1677FF';
};

const GlobalSettings: React.FC<GlobalSettingsProps> = ({ theme, isLoading, onSave, onDelete }) => {
  const [form] = Form.useForm();
  const [isDirty, setIsDirty] = useState(false);
  const ignoreChangeRef = useRef(false);

  // Sync theme into form when theme loads (programmatic changes should not mark dirty)
  useEffect(() => {
    ignoreChangeRef.current = true;
    form.setFieldsValue({
      primaryColor: theme?.primaryColor ?? '#1677FF',
      secondaryColor: theme?.secondaryColor ?? '#FFFFFF',
      fontFamily: theme?.fontFamily ?? 'Inter',
      isPublished: theme?.isPublished ?? true,
    });
    setIsDirty(false);
    // Use a microtask to flip the flag back after the form batch settles
    Promise.resolve().then(() => { ignoreChangeRef.current = false; });
  }, [theme, form]);

  const handleValuesChange = useCallback(() => {
    if (!ignoreChangeRef.current) {
      setIsDirty(true);
    }
  }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload: ICreateThemePayload = {
        primaryColor: toHex(values.primaryColor),
        secondaryColor: toHex(values.secondaryColor),
        fontFamily: values.fontFamily,
        isPublished: values.isPublished,
      };
      await onSave(payload);
      setIsDirty(false);
    } catch {
      // validation error — Ant Design shows inline messages
    }
  };

  const handleReset = () => {
    ignoreChangeRef.current = true;
    form.setFieldsValue({
      primaryColor: theme?.primaryColor ?? '#1677FF',
      secondaryColor: theme?.secondaryColor ?? '#FFFFFF',
      fontFamily: theme?.fontFamily ?? 'Inter',
      isPublished: theme?.isPublished ?? true,
    });
    setIsDirty(false);
    Promise.resolve().then(() => { ignoreChangeRef.current = false; });
  };

  return (
    <div className="w-[320px] h-full bg-white border-l border-gray-200 p-4 overflow-y-auto shrink-0">
      <Title level={5} className="!mb-3">
        <BgColorsOutlined className="mr-2" />
        Thiết lập toàn cục
      </Title>

      <Form
        form={form}
        layout="vertical"
        size="small"
        onValuesChange={handleValuesChange}
        initialValues={{
          primaryColor: theme?.primaryColor ?? '#1677FF',
          secondaryColor: theme?.secondaryColor ?? '#FFFFFF',
          fontFamily: theme?.fontFamily ?? 'Inter',
          isPublished: theme?.isPublished ?? true,
        }}
      >
        <Form.Item
          name="primaryColor"
          label="Màu chủ đạo"
          rules={[{ required: true, message: 'Vui lòng chọn màu chủ đạo' }]}
          getValueFromEvent={toHex}
        >
          <ColorPicker format="hex" showText className="w-full" />
        </Form.Item>

        <Form.Item
          name="secondaryColor"
          label="Màu nền phụ"
          rules={[{ required: true, message: 'Vui lòng chọn màu phụ' }]}
          getValueFromEvent={toHex}
        >
          <ColorPicker format="hex" showText className="w-full" />
        </Form.Item>

        <Form.Item
          name="fontFamily"
          label={<span><FontSizeOutlined className="mr-1" />Phông chữ</span>}
          rules={[{ required: true, message: 'Vui lòng chọn phông chữ' }]}
        >
          <Select options={FONT_OPTIONS} showSearch />
        </Form.Item>

        <Form.Item
          name="isPublished"
          label="Kích hoạt"
          valuePropName="checked"
        >
          <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
        </Form.Item>
      </Form>

      {theme && (
        <div className="flex flex-wrap gap-1 mb-3">
          <Tag color="blue" className="text-[10px]">
            Tạo: {new Date(theme.createdAt).toLocaleString('vi-VN')}
          </Tag>
          <Tag color="green" className="text-[10px]">
            Sửa: {new Date(theme.updatedAt).toLocaleString('vi-VN')}
          </Tag>
        </div>
      )}

      <Divider className="!my-3" />

      <div className="flex flex-col gap-2">
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={isLoading}
          disabled={!isDirty}
          className="!bg-indigo-600"
          block
        >
          {theme ? 'Cập nhật giao diện' : 'Tạo giao diện'}
        </Button>
        {isDirty && (
          <Button icon={<UndoOutlined />} onClick={handleReset} block>
            Hoàn tác
          </Button>
        )}
        {theme && (
          <Popconfirm
            title="Xoá giao diện?"
            description="Shop sẽ quay về giao diện mặc định."
            onConfirm={onDelete}
            okText="Xoá"
            cancelText="Huỷ"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} block>
              Xoá giao diện
            </Button>
          </Popconfirm>
        )}
      </div>
    </div>
  );
};

export default GlobalSettings;
