import React, { useState, useEffect } from 'react';
import { Typography, Button, Card, Tag, Modal, Space, Popconfirm, message, Form, Input, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, StarFilled } from '@ant-design/icons';
import { useUser } from '@/hooks/useUser'; // Dùng Redux Hook
import { AddressSelector } from '@/components/address';
import type { AddressSelectorValue } from '@/components/address';

const { Title, Text } = Typography;

const AddressBook: React.FC = () => {
  // Lấy state và actions từ Redux
  const { myAddresses, isLoading, fetchMyAddresses, createMyAddress, updateMyAddress, deleteMyAddress } = useUser();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  
  const [addressValue, setAddressValue] = useState<AddressSelectorValue>({ newWardCode: '', detailAddress: '' });

  // Tải danh sách địa chỉ khi render lần đầu
  useEffect(() => {
    fetchMyAddresses();
  }, []);

  const openModal = (address?: any) => {
    if (address) {
      setEditingId(address.id);
      form.setFieldsValue({ tag: address.tag, isDefault: address.default });
      setAddressValue({
        newWardCode: address.commune_code,
        newProvinceCode: address.province_code,
        detailAddress: address.street,
      });
    } else {
      setEditingId(null);
      form.resetFields();
      setAddressValue({ newWardCode: '', detailAddress: '' });
    }
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMyAddress(id);
      message.success('Đã xóa địa chỉ');
    } catch (error) {
      message.error(typeof error === 'string' ? error : 'Không thể xóa địa chỉ');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!addressValue.newWardCode || !addressValue.detailAddress) {
        return message.error('Vui lòng chọn phường/xã và nhập địa chỉ chi tiết');
      }

      const payload = {
        communeCode: addressValue.newWardCode,
        provinceCode: addressValue.newProvinceCode,
        detailAddress: addressValue.detailAddress,
        tag: values.tag,
        isDefault: values.isDefault,
      };

      if (editingId) {
        await updateMyAddress(editingId, payload);
        message.success('Cập nhật thành công');
      } else {
        await createMyAddress(payload);
        message.success('Thêm địa chỉ thành công');
      }
      setIsModalVisible(false);
    } catch (error) {
       // Ignore validate error from form
       if((error as any).errorFields) return; 
       message.error(typeof error === 'string' ? error : 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="!m-0">Sổ địa chỉ của tôi</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} disabled={myAddresses.length >= 10}>
          Thêm địa chỉ mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myAddresses.map((addr) => (
          <Card 
            key={addr.id} 
            loading={isLoading}
            className={`border ${addr.default ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'}`}
            actions={[
              <Button type="text" icon={<EditOutlined />} onClick={() => openModal(addr)}>Sửa</Button>,
              <Popconfirm title="Xóa địa chỉ này?" onConfirm={() => handleDelete(addr.id)}>
                <Button type="text" danger icon={<DeleteOutlined />}>Xóa</Button>
              </Popconfirm>
            ]}
          >
            <div className="flex justify-between items-start mb-2">
              <Space>
                {addr.tag && <Tag color="cyan">{addr.tag}</Tag>}
                {addr.default && <Tag icon={<StarFilled />} color="blue">Mặc định</Tag>}
              </Space>
            </div>
            <Text className="text-gray-800 font-medium block mb-1">{addr.street}</Text>
            <Text className="text-gray-500 text-sm block">{addr.commune}, {addr.province}</Text>
          </Card>
        ))}
        {!isLoading && myAddresses.length === 0 && (
          <div className="col-span-2 text-center text-gray-400 py-10">Bạn chưa lưu địa chỉ nào</div>
        )}
      </div>

      <Modal
        title={editingId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={isLoading}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="tag" label="Nhãn (Ví dụ: Nhà riêng, Công ty)">
            <Input placeholder="Nhập nhãn địa chỉ..." />
          </Form.Item>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium">Thông tin địa chỉ <span className="text-red-500">*</span></label>
            <AddressSelector
              value={addressValue}
              onChange={setAddressValue}
              required={true}
              showModeSelector={true}
              defaultMode="new"
              layout="vertical"
            />
          </div>

          <Form.Item name="isDefault" valuePropName="checked">
            <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddressBook;