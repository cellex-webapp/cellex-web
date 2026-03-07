import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Upload, message, Row, Col, Card, Space, App } from 'antd';
import { UploadOutlined, ShopOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, PictureOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import useShop from '@/hooks/useShop';
import { AddressSelector } from '@/components/address';
import type { AddressSelectorValue } from '@/components/address';
// import { addressService } from '@/services/address.service';

interface ShopFormModalProps {
    shop: IShop | null;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ShopFormModal: React.FC<ShopFormModalProps> = ({ shop, open, onClose, onSuccess }) => {
    const { createShop, updateMyShop, isLoading } = useShop();
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    // Address state using new dual system
    const [addressValue, setAddressValue] = useState<AddressSelectorValue>({
        newWardCode: '',
        detailAddress: '',
    });

    // Load existing shop address when editing
    useEffect(() => {
        if (open && shop) {
            form.setFieldsValue({
                shopName: shop.shop_name,
                description: shop.description,
                phoneNumber: shop.phone_number,
                email: shop.email,
            });

            // Set address from existing shop - use commune_code as new ward code
            // Cần mapping từ địa chỉ cũ sang mới nếu shop chưa có new_ward_code
            if (shop.address) {
                setAddressValue({
                    newWardCode: shop.address.communeCode || '',
                    newProvinceCode: shop.address.provinceCode || '',
                    detailAddress: shop.address.street || '',
                });
            }

            if (shop.logo_url) {
                setFileList([{ uid: '-1', name: 'logo.png', status: 'done', url: shop.logo_url }]);
            } else {
                setFileList([]);
            }
        } else if (!shop) {
            form.resetFields();
            setFileList([]);
            setAddressValue({ newWardCode: '', detailAddress: '' });
        }
    }, [shop, form, open]);

    const handleFinish = async (values: any) => {
        if (!addressValue.newWardCode) {
            message.warning('Vui lòng chọn địa chỉ phường/xã');
            return;
        }
        if (!addressValue.detailAddress?.trim()) {
            message.warning('Vui lòng nhập địa chỉ chi tiết');
            return;
        }

        try {
            const payload: IUpdateMyShopPayload = {
                shopName: values.shopName,
                description: values.description,
                provinceCode: addressValue.newProvinceCode || '',
                communeCode: addressValue.newWardCode,
                detailAddress: addressValue.detailAddress,
                phoneNumber: values.phoneNumber,
                email: values.email,
                logo: fileList.length > 0 && fileList[0].originFileObj ? fileList[0].originFileObj : undefined,
            };

            if (shop) {
                await updateMyShop(payload).unwrap();
                message.success('Cập nhật cửa hàng thành công!');
            } else {
                await createShop(payload as any).unwrap();
                message.success('Đăng ký cửa hàng thành công!');
            }
            onSuccess();
        } catch (err: any) {
            message.error(err.message || 'Thao tác thất bại');
        }
    };

    const handleClose = () => {
        form.resetFields();
        setFileList([]);
        setAddressValue({ newWardCode: '', detailAddress: '' });
        onClose();
    };

    return (
        <Modal
            title={
                <Space>
                    <ShopOutlined />
                    <span className="font-semibold">
                        {shop ? 'Cập nhật thông tin cửa hàng' : 'Đăng ký cửa hàng mới'}
                    </span>
                </Space>
            }
            open={open}
            onCancel={handleClose}
            footer={null}
            destroyOnClose
            width={900}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Row gutter={24}>
                    <Col xs={24} md={16}>
                        <Card size="small" className="mb-4" title={<Space><ShopOutlined />Thông tin cơ bản</Space>}>
                            <Form.Item name="shopName" label="Tên cửa hàng" rules={[{ required: true }]}>
                                <Input size="large" placeholder="Tên cửa hàng" />
                            </Form.Item>
                            <Form.Item name="description" label="Mô tả">
                                <Input.TextArea size="large" rows={3} placeholder="Mô tả về cửa hàng" showCount maxLength={500} />
                            </Form.Item>
                        </Card>

                        <Card 
                            size="small" 
                            className="mb-4" 
                            title={
                                <Space>
                                    <EnvironmentOutlined className="text-green-500" />
                                    <span>Địa chỉ</span>
                                </Space>
                            }
                        >
                            <AddressSelector
                                value={addressValue}
                                onChange={setAddressValue}
                                required={true}
                                showModeSelector={true}
                                defaultMode="new"
                                layout="horizontal"
                                size="large"
                            />
                        </Card>

                        <Card size="small" className="mb-4" title={<Space><PhoneOutlined />Thông tin liên hệ</Space>}>
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true }]}>
                                        <Input size="large" prefix={<PhoneOutlined />} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                                        <Input size="large" prefix={<MailOutlined />} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    
                    <Col xs={24} md={8}>
                        <Card size="small" className="mb-4 sticky top-0" title={<Space><PictureOutlined />Logo cửa hàng</Space>}>
                            <Form.Item name="logo" className="mb-0 flex justify-center">
                                <Upload
                                    listType="picture-card"
                                    fileList={fileList}
                                    onChange={({ fileList }) => setFileList(fileList)}
                                    beforeUpload={() => false}
                                    maxCount={1}
                                >
                                    {fileList.length === 0 && (<div><UploadOutlined /><div style={{ marginTop: 8 }}>Tải lên</div></div>)}
                                </Upload>
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>

                <Form.Item className="mt-4">
                    <div className="flex justify-end gap-2">
                        <Button size="large" onClick={handleClose} disabled={isLoading}>
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isLoading}
                            size="large"
                            className="!bg-indigo-600"
                        >
                            {shop ? 'Lưu thay đổi' : 'Đăng ký'}
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

const ShopFormModalWithApp: React.FC<ShopFormModalProps> = (props) => (
    <App>
        <ShopFormModal {...props} />
    </App>
);

export default ShopFormModalWithApp;