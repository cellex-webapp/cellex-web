import React, { useEffect, useState } from 'react';
import { Form, Button, Select, Input, Row, Col, Modal, Switch, message, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { attributeService } from '@/services/attribute.service';

interface Props {
    form: any;
}

const AttributeEditor: React.FC<Props> = ({ form }) => {
    const [categoryAttributes, setCategoryAttributes] = useState<IAttribute[]>([]);
    const [createAttrOpen, setCreateAttrOpen] = useState(false);
    const [newAttrForm] = Form.useForm<any>();

    const selectedCategoryId = Form.useWatch('categoryId', form);

    useEffect(() => {
        const loadAttrs = async () => {
            if (!selectedCategoryId) {
                setCategoryAttributes([]);
                return;
            }
            try {
                const resp = await attributeService.getAttributesOfCategory(selectedCategoryId);
                setCategoryAttributes(resp.result || []);
            } catch (e) {
                setCategoryAttributes([]);
            }
        };
        loadAttrs();
    }, [selectedCategoryId]);

    return (
        <>
            <Form.Item
                label="Thuộc tính"
                extra={
                    <Tooltip title={selectedCategoryId ? '' : 'Chọn danh mục trước khi tạo thuộc tính'}>
                        <Button size="small" icon={<PlusOutlined />} disabled={!selectedCategoryId} onClick={() => setCreateAttrOpen(true)}>
                            Tạo thuộc tính mới
                        </Button>
                    </Tooltip>
                }
            >
                <Form.List name="attributeItems">
                    {(fields, { add, remove }) => (
                        <div className="flex flex-col gap-3 mb-3">
                            {fields.map((field) => (
                                <Row key={field.key} gutter={8} align="middle" className="items-center">
                                    <Col xs={11} md={10} className="">
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'attributeId']}
                                            fieldKey={[field.fieldKey!, 'attributeId'] as any}
                                            rules={[{ required: true, message: 'Chọn thuộc tính' }]}
                                            noStyle
                                        >
                                            <Select
                                                placeholder="Chọn thuộc tính"
                                                showSearch
                                                optionFilterProp="label"
                                                options={(categoryAttributes || []).map((a) => ({ value: a.id, label: a.attributeName }))}
                                                disabled={!selectedCategoryId}
                                                className="w-full"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={11} md={10} className="">
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'value']}
                                            fieldKey={[field.fieldKey!, 'value'] as any}
                                            rules={[{ required: true, message: 'Nhập giá trị' }]}
                                            noStyle
                                        >
                                            <Input placeholder="Giá trị" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={2} md={4} className="text-center">
                                        <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                                    </Col>
                                </Row>
                            ))}

                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} disabled={!selectedCategoryId}>
                                Thêm thuộc tính
                            </Button>
                        </div>
                    )}
                </Form.List>
            </Form.Item>

            <Modal
                open={createAttrOpen}
                onCancel={() => setCreateAttrOpen(false)}
                onOk={async () => {
                    try {
                        const v = await newAttrForm.validateFields();
                        const payload: ICreateUpdateAttributePayload = {
                            attributeName: v.attributeName,
                            attributeKey: String(v.attributeName || '').trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
                            dataType: v.dataType || 'TEXT',
                            unit: v.unit || '',
                            isRequired: !!v.isRequired,
                            isHighlight: !!v.isHighlight,
                            description: v.description,
                        };
                        if (!selectedCategoryId) return;
                        await attributeService.createAttributeOfCategory(selectedCategoryId, payload);
                        message.success('Tạo thuộc tính thành công');
                        const resp = await attributeService.getAttributesOfCategory(selectedCategoryId);
                        setCategoryAttributes(resp.result || []);
                        setCreateAttrOpen(false);
                        newAttrForm.resetFields();
                    } catch (e: any) {
                        if (e?.errorFields) return;
                        message.error('Không thể tạo thuộc tính');
                    }
                }}
                title="Tạo thuộc tính mới"
                destroyOnClose
                centered
            >
                <Form form={newAttrForm} layout="vertical" preserve={false} initialValues={{ dataType: 'TEXT', isRequired: false, isHighlight: false }}>
                    <Form.Item name="attributeName" label="Tên thuộc tính" rules={[{ required: true, message: 'Nhập tên thuộc tính' }]}>
                        <Input placeholder="VD: Màu sắc, Bộ nhớ" />
                    </Form.Item>
                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="dataType" label="Kiểu dữ liệu">
                                <Select
                                    options={[
                                        { value: 'TEXT', label: 'Text' },
                                        { value: 'NUMBER', label: 'Number' },
                                        { value: 'BOOLEAN', label: 'Boolean' },
                                        { value: 'SELECT', label: 'Select' },
                                        { value: 'MULTI_SELECT', label: 'Multi Select' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="unit" label="Đơn vị">
                                <Input placeholder="VD: GB, inch, cm" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="isRequired" label="Bắt buộc" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="isHighlight" label="Nổi bật" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default AttributeEditor;
