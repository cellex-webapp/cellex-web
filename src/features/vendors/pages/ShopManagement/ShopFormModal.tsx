import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Upload, message, Row, Col, Card, Space, Select, App } from 'antd';
import { UploadOutlined, ShopOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, PictureOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import useShop from '@/hooks/useShop';
import { addressService } from '@/services/address.service';

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

    const [provinces, setProvinces] = useState<IAddressDataUnit[]>([]);
    const [communes, setCommunes] = useState<IAddressDataUnit[]>([]);
    const [provincesLoading, setProvincesLoading] = useState(false);
    const [communesLoading, setCommunesLoading] = useState(false);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | undefined>();

    useEffect(() => {
        (async () => {
            setProvincesLoading(true);
            try {
                const resp = await addressService.getProvinces();
                setProvinces(resp.result || []);
            } catch (e) {
                message.error("Không thể tải danh sách tỉnh/thành");
            }
            setProvincesLoading(false);
        })();
    }, []);

    useEffect(() => {
        if (!selectedProvinceCode) {
            setCommunes([]);
            return;
        }
        (async () => {
            setCommunesLoading(true);
            try {
                const resp = await addressService.getCommunesByProvinceCode(selectedProvinceCode);
                setCommunes(resp.result || []);
            } catch (e) {
                message.error("Không thể tải danh sách xã/phường");
            }
            setCommunesLoading(false);
        })();
    }, [selectedProvinceCode]);

    useEffect(() => {
        if (open && shop && provinces.length > 0) {
            const provinceName = shop.address?.province;
            const matchingProvince = provinces.find(p => p.name === provinceName);
            const provinceCode = matchingProvince?.code;

            form.setFieldsValue({
                shopName: shop.shop_name,
                description: shop.description,
                detailAddress: shop.address?.street,
                phoneNumber: shop.phone_number,
                email: shop.email,
                provinceCode: provinceCode,
            });

            if (provinceCode) {
                setSelectedProvinceCode(provinceCode);
            }

            if (shop.logo_url) {
                setFileList([{ uid: '-1', name: 'logo.png', status: 'done', url: shop.logo_url }]);
            } else {
                setFileList([]);
            }
        } else if (!shop) {
            form.resetFields();
            setFileList([]);
        }
    }, [shop, provinces, form, open]);

    useEffect(() => {
        if (open && shop && communes.length > 0) {
            const communeName = shop.address?.commune;
            const matchingCommune = communes.find(c => c.name === communeName);
            const communeCode = matchingCommune?.code;

            if (communeCode) {
                form.setFieldsValue({ communeCode: communeCode });
            }
        }
    }, [shop, communes, form, open]);

    const handleFinish = async (values: any) => {
        try {
            const payload: IUpdateMyShopPayload = {
                shopName: values.shopName,
                description: values.description,
                provinceCode: values.provinceCode,
                communeCode: values.communeCode,
                detailAddress: values.detailAddress,
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
            onCancel={onClose}
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
                                <Input.TextArea size="large" rows={3} placeholder="Mô tả về cửa hàng" />
                            </Form.Item>
                        </Card>

                        <Card size="small" className="mb-4" title={<Space><EnvironmentOutlined />Địa chỉ</Space>}>
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item name="provinceCode" label="Tỉnh/Thành phố" rules={[{ required: true }]}>
                                        <Select
                                            size="large"
                                            showSearch
                                            placeholder="Chọn tỉnh/thành"
                                            loading={provincesLoading}
                                            optionFilterProp="label"
                                            onChange={(code) => setSelectedProvinceCode(code)}
                                            options={provinces.map(p => ({ label: p.name, value: p.code }))}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="communeCode" label="Xã/Phường" rules={[{ required: true }]}>
                                        <Select
                                            size="large"
                                            showSearch
                                            placeholder="Chọn xã/phường"
                                            loading={communesLoading}
                                            disabled={!selectedProvinceCode}
                                            optionFilterProp="label"
                                            options={communes.map(c => ({ label: c.name, value: c.code }))}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item name="detailAddress" label="Địa chỉ chi tiết" rules={[{ required: true }]}>
                                <Input size="large" placeholder="Số nhà, tên đường..." />
                            </Form.Item>
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
                        <Button size="large" onClick={onClose} disabled={isLoading}>
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