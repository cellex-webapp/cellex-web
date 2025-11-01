import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Checkbox, Select, Button, InputNumber } from 'antd';
import { SettingOutlined, NumberOutlined, FileTextOutlined, OrderedListOutlined } from '@ant-design/icons';

type Props = {
  open: boolean;
  loading?: boolean;
  editingAttribute?: IAttribute | null;
  onClose: () => void;
  onSubmit: (payload: ICreateUpdateAttributePayload | (ICreateUpdateAttributePayload & { id: string })) => void | Promise<void>;
};

const dataTypeOptions = [
  { label: 'TEXT - Văn bản tự do', value: 'TEXT' },
  { label: 'NUMBER - Số', value: 'NUMBER' },
  { label: 'BOOLEAN - Đúng/Sai', value: 'BOOLEAN' },
  { label: 'SELECT - Chọn 1 giá trị', value: 'SELECT' },
  { label: 'MULTI_SELECT - Chọn nhiều giá trị', value: 'MULTI_SELECT' },
];

const AttributeFormModal: React.FC<Props> = ({ open, loading, editingAttribute, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [dataType, setDataType] = useState<DataType | undefined>();

  useEffect(() => {
    if (editingAttribute) {
      form.setFieldsValue({
        attributeName: editingAttribute.attributeName,
        attributeKey: editingAttribute.attributeKey,
        dataType: editingAttribute.dataType,
        unit: editingAttribute.unit,
        isRequired: editingAttribute.isRequired,
        isHighlight: editingAttribute.isHighlight,
        selectOptions: editingAttribute.selectOptions?.join(', ') || '',
        sortOrder: editingAttribute.sortOrder || 0,
        description: editingAttribute.description,
      });
      setDataType(editingAttribute.dataType as DataType);
    } else {
      form.resetFields();
      setDataType(undefined);
    }
  }, [editingAttribute, form]);

  const handleOk = async () => {
    const values = await form.validateFields();

    // Parse selectOptions from comma-separated string to array
    const selectOptions = values.selectOptions
      ? values.selectOptions.split(',').map((s: string) => s.trim()).filter((s: string) => s)
      : undefined;

    const payload: any = {
      attributeName: values.attributeName,
      attributeKey: values.attributeKey,
      dataType: values.dataType,
      unit: values.unit || undefined,
      isRequired: values.isRequired || false,
      isHighlight: values.isHighlight || false,
      selectOptions,
      sortOrder: values.sortOrder || 0,
      description: values.description || undefined,
    };

    if (editingAttribute) {
      await onSubmit({ id: editingAttribute.id, ...payload });
    } else {
      await onSubmit(payload as ICreateUpdateAttributePayload);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <SettingOutlined />
          <span>{editingAttribute ? 'Sửa thuộc tính' : 'Tạo thuộc tính mới'}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={700}
      style={{ top: 20 }}
    >
      <Form form={form} layout="vertical" className="mt-6">
        <Form.Item
          name="attributeName"
          label={<span><FileTextOutlined /> Tên thuộc tính</span>}
          rules={[{ required: true, message: 'Vui lòng nhập tên thuộc tính' }]}
        >
          <Input placeholder="VD: Dung lượng RAM, Màu sắc, Trọng lượng" size="large" />
        </Form.Item>

        <Form.Item
          name="attributeKey"
          label={<span><NumberOutlined /> Key (định danh duy nhất)</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập key' },
            { pattern: /^[a-z_]+$/, message: 'Key chỉ chứa chữ thường và dấu gạch dưới' }
          ]}
        >
          <Input placeholder="VD: ram_capacity, color, weight" size="large" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="dataType"
            label="Loại dữ liệu"
            rules={[{ required: true, message: 'Vui lòng chọn loại dữ liệu' }]}
          >
            <Select
              options={dataTypeOptions}
              size="large"
              onChange={(value) => setDataType(value as DataType)}
            />
          </Form.Item>

          <Form.Item
            name="unit"
            label="Đơn vị"
          >
            <Input placeholder="VD: GB, cm, gram" size="large" />
          </Form.Item>
        </div>

        <Form.Item
          name="description"
          label="Mô tả"
        >
          <Input.TextArea rows={2} placeholder="Mô tả chi tiết về thuộc tính này" />
        </Form.Item>

        {(dataType === 'SELECT' || dataType === 'MULTI_SELECT') && (
          <Form.Item
            name="selectOptions"
            label={<span><OrderedListOutlined /> Các giá trị lựa chọn (phân cách bằng dấu phẩy)</span>}
            rules={[{ required: true, message: 'Vui lòng nhập các giá trị' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="VD: 4GB, 8GB, 16GB, 32GB hoặc Đen, Trắng, Xanh, Đỏ"
            />
          </Form.Item>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Form.Item name="isRequired" valuePropName="checked">
            <Checkbox>
              <span className="font-medium">Bắt buộc</span>
              <div className="text-xs text-gray-500">Phải nhập khi tạo sản phẩm</div>
            </Checkbox>
          </Form.Item>

          <Form.Item name="isHighlight" valuePropName="checked">
            <Checkbox>
              <span className="font-medium">Nổi bật</span>
              <div className="text-xs text-gray-500">Hiển thị trên card SP</div>
            </Checkbox>
          </Form.Item>

          <Form.Item
            name="sortOrder"
            initialValue={0}
            className="flex flex-col sm:flex-row sm:items-center sm:gap-3"
          >
            <span className="font-semibold whitespace-nowrap mb-1 sm:mb-0 mr-2">Thứ tự:</span>
            <InputNumber min={0} size="large" className="w-full sm:w-32" />
          </Form.Item>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onClose} size="large">Hủy</Button>
          <Button type="primary" onClick={handleOk} loading={loading} size="large">
            {editingAttribute ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AttributeFormModal;
