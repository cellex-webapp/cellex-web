import React, { useEffect } from 'react';
import { Modal, Form, Input, Checkbox, Select, Button } from 'antd';

type Props = {
  open: boolean;
  loading?: boolean;
  editingAttribute?: IAttribute | null;
  onClose: () => void;
  onSubmit: (payload: ICreateUpdateAttributePayload | (ICreateUpdateAttributePayload & { id: string })) => void | Promise<void>;
};

const dataTypeOptions = [
  { label: 'STRING', value: 'STRING' },
  { label: 'NUMBER', value: 'NUMBER' },
  { label: 'BOOLEAN', value: 'BOOLEAN' },
  { label: 'ENUM', value: 'ENUM' },
];

const AttributeFormModal: React.FC<Props> = ({ open, loading, editingAttribute, onClose, onSubmit }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingAttribute) {
      form.setFieldsValue({
        attributeName: editingAttribute.attributeName,
        attributeKey: editingAttribute.attributeKey,
        dataType: editingAttribute.dataType,
        isRequired: editingAttribute.isRequired,
        isHighlight: editingAttribute.isHighlight,
      });
    } else {
      form.resetFields();
    }
  }, [editingAttribute, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    if (editingAttribute) {
      await onSubmit({ id: editingAttribute.id, ...values });
    } else {
      await onSubmit(values as ICreateUpdateAttributePayload);
    }
  };

  return (
    <Modal title={editingAttribute ? 'Sửa thuộc tính' : 'Tạo thuộc tính'} open={open} onCancel={onClose} footer={null} destroyOnClose>
      <Form form={form} layout="vertical">
        <Form.Item name="attributeName" label="Tên thuộc tính" rules={[{ required: true, message: 'Nhập tên thuộc tính' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="attributeKey" label="Key" rules={[{ required: true, message: 'Nhập key' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="dataType" label="Loại dữ liệu" rules={[{ required: true, message: 'Chọn loại dữ liệu' }]}>
          <Select options={dataTypeOptions} />
        </Form.Item>

        <Form.Item name="isRequired" valuePropName="checked">
          <Checkbox> Bắt buộc</Checkbox>
        </Form.Item>

        <Form.Item name="isHighlight" valuePropName="checked">
          <Checkbox> Nổi bật</Checkbox>
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" onClick={handleOk} loading={loading}>Lưu</Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AttributeFormModal;
