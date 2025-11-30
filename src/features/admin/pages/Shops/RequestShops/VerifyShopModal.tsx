import React, { useEffect, useState } from 'react';
import { Modal, Radio, Input, Descriptions, Spin, message, Space, Tag, Avatar } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ShopOutlined } from '@ant-design/icons';
import { shopService } from '@/services/shop.service';
import useShop from '@/hooks/useShop';

const { TextArea } = Input;

interface Props {
  visible: boolean;
  shopId: string | null;
  defaultAction?: 'approve' | 'reject' | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const VerifyShopModal: React.FC<Props> = ({ visible, shopId, defaultAction = null, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState<IShop | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(defaultAction);
  const [reason, setReason] = useState('');
  
  const { verifyRegisterShop } = useShop();

  useEffect(() => {
    if (visible) {
        setAction(defaultAction);
        setReason('');
    }
  }, [defaultAction, visible]);

  useEffect(() => {
    if (!visible || !shopId) return;
    setLoading(true);
    shopService.getShopById(shopId)
      .then((resp) => setShop(resp.result))
      .catch(() => message.error('Lỗi tải thông tin shop'))
      .finally(() => setLoading(false));
  }, [visible, shopId]);

  const handleConfirm = async () => {
    if (!shopId || !action) {
      message.warning('Vui lòng chọn hành động (Duyệt/Từ chối)');
      return;
    }
    if (action === 'reject' && !reason.trim()) {
        message.error('Vui lòng nhập lý do từ chối');
        return;
    }

    try {
      setLoading(true);
      await verifyRegisterShop({
        shopId,
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        rejectionReason: action === 'reject' ? reason : undefined,
      }).unwrap();
      
      message.success('Xử lý thành công');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      message.error(typeof err === 'string' ? err : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<span className="font-semibold">Duyệt yêu cầu mở Shop</span>}
      open={visible}
      onCancel={onClose}
      onOk={handleConfirm}
      okText="Xác nhận"
      okButtonProps={{ disabled: !action }}
      confirmLoading={loading}
      width={700}
      centered
    >
      {loading && !shop ? (
        <div className="py-10 text-center"><Spin /></div>
      ) : shop ? (
        <div className="space-y-6">
           {/* Header Info */}
           <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <Avatar src={shop.logo_url} size={64} icon={<ShopOutlined />} shape="square" className="bg-white border"/>
              <div>
                 <div className="text-lg font-bold">{shop.shop_name}</div>
                 <div className="text-gray-500">{shop.email}</div>
                 <div className="mt-1"><Tag color="orange">PENDING</Tag></div>
              </div>
           </div>

           <Descriptions title="Thông tin chi tiết" column={1} size="small" bordered>
              <Descriptions.Item label="SĐT">{shop.phone_number}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">{shop.address?.fullAddress || `${shop.address?.street}...`}</Descriptions.Item>
              <Descriptions.Item label="Mô tả">{shop.description}</Descriptions.Item>
           </Descriptions>

           <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="font-semibold mb-3 text-blue-800">Hành động của Admin:</div>
              <Radio.Group value={action} onChange={e => setAction(e.target.value)}className="w-full">
                 <Space direction="vertical" className="w-full">
                    <Radio value="approve" className="font-medium text-green-700">
                        <Space><CheckCircleOutlined /> Duyệt yêu cầu</Space>
                    </Radio>
                    <Radio value="reject" className="font-medium text-red-700">
                        <Space><CloseCircleOutlined /> Từ chối yêu cầu</Space>
                    </Radio>
                 </Space>
              </Radio.Group>

              {action === 'reject' && (
                  <TextArea 
                    className="mt-3" 
                    placeholder="Nhập lý do từ chối..." 
                    rows={3} 
                    value={reason} 
                    onChange={e => setReason(e.target.value)}
                  />
              )}
           </div>
        </div>
      ) : (
         <div className="text-center text-gray-400">Không có dữ liệu</div>
      )}
    </Modal>
  );
};

export default VerifyShopModal;