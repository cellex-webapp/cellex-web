import React, { useEffect, useState } from 'react';
import { Form, Button, Select, Input, Row, Col, Modal, Switch, message, Tooltip, type FormInstance } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { attributeService } from '@/services/attribute.service';

interface Props {
  form: FormInstance;
}

const AttributeEditor: React.FC<Props> = ({ form }) => {
  const [categoryAttributes, setCategoryAttributes] = useState<IAttribute[]>([]);
  const [createAttrOpen, setCreateAttrOpen] = useState(false);
  const [newAttrForm] = Form.useForm();

  const selectedCategoryId = Form.useWatch('categoryId', form);

  useEffect(() => {
    const loadAttrs = async () => {
      if (!selectedCategoryId) {
        setCategoryAttributes([]);
        return;
      }
      try {
        const resp = await attributeService.getAttributesOfCategory(selectedCategoryId, { limit: 100 }); 
        setCategoryAttributes(resp.result?.content || []);
      } catch (e) {
        setCategoryAttributes([]);
      }
    };
    loadAttrs();
  }, [selectedCategoryId]);

  const handleCreateAttribute = async () => {
    try {
      const v = await newAttrForm.validateFields();
      const payload: ICreateUpdateAttributePayload = {
        ...v,
        attributeKey: v.attributeKey || String(v.attributeName || '').trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      };
      
      if (!selectedCategoryId) return;
      
      await attributeService.createAttributeOfCategory(selectedCategoryId, payload);
      message.success('Tạo thuộc tính thành công');
      
      const resp = await attributeService.getAttributesOfCategory(selectedCategoryId, { limit: 100 });
      setCategoryAttributes(resp.result?.content || []);
      
      setCreateAttrOpen(false);
      newAttrForm.resetFields();
    } catch (e) {
      message.error('Không thể tạo thuộc tính');
    }
  };

  return (
    <>
      <Form.Item
        label="Thuộc tính sản phẩm"
        extra={
          <Tooltip title={selectedCategoryId ? '' : 'Chọn danh mục trước'}>
            <Button size="small" type="dashed" icon={<PlusOutlined />} disabled={!selectedCategoryId} onClick={() => setCreateAttrOpen(true)}>
              Tạo thuộc tính mới
            </Button>
          </Tooltip>
        }
      >
        <Form.List name="attributeItems">
          {(fields, { add, remove }) => (
            <div className="flex flex-col gap-2">
              {fields.map((field) => (
                <Row key={field.key} gutter={8} align="middle">
                  <Col span={10}>
                    <Form.Item
                      {...field}
                      name={[field.name, 'attributeId']}
                      rules={[{ required: true, message: 'Chọn thuộc tính' }]}
                      noStyle
                    >
                      <Select
                        placeholder="Tên thuộc tính"
                        showSearch
                        optionFilterProp="label"
                        options={categoryAttributes.map((a) => ({ value: a.id, label: a.attributeName }))}
                        disabled={!selectedCategoryId}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      {...field}
                      name={[field.name, 'value']}
                      rules={[{ required: true, message: 'Nhập giá trị' }]}
                      noStyle
                    >
                      <Input placeholder="Giá trị (VD: Đỏ, 64GB...)" />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                  </Col>
                </Row>
              ))}
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} disabled={!selectedCategoryId}>
                Thêm dòng
              </Button>
            </div>
          )}
        </Form.List>
      </Form.Item>

      <Modal
        open={createAttrOpen}
        onCancel={() => setCreateAttrOpen(false)}
        onOk={handleCreateAttribute}
        title="Tạo thuộc tính mới"
        centered
        destroyOnClose
      >
        <Form form={newAttrForm} layout="vertical" initialValues={{ dataType: 'TEXT', isRequired: false }}>
          <Form.Item name="attributeName" label="Tên thuộc tính" rules={[{ required: true }]}>
            <Input placeholder="VD: Màu sắc" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
               <Form.Item name="dataType" label="Kiểu dữ liệu">
                 <Select options={[{value:'TEXT', label:'Text'}, {value:'NUMBER', label:'Number'}]} />
               </Form.Item>
            </Col>
            <Col span={12}>
               <Form.Item name="unit" label="Đơn vị (Optional)">
                 <Input placeholder="VD: kg, cm" />
               </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
             <Col span={12}><Form.Item name="isRequired" label="Bắt buộc" valuePropName="checked"><Switch /></Form.Item></Col>
             <Col span={12}><Form.Item name="isHighlight" label="Nổi bật" valuePropName="checked"><Switch /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default AttributeEditor;