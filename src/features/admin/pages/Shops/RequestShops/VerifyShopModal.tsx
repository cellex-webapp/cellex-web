import React, { useEffect, useState } from 'react';
import { Modal, Radio, Input, Descriptions, Spin, message, Space, Tag, Avatar, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ShopOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
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
    setAction(defaultAction ?? null);
  }, [defaultAction, visible]);

  useEffect(() => {
    if (!visible || !shopId) return;
    let mounted = true;
    setLoading(true);
    shopService.getShopById(shopId)
      .then((resp: any) => {
        if (!mounted) return;
        setShop(resp.result ?? null);
      })
      .catch((err) => {
        console.error('Failed to fetch shop', err);
        message.error('Không thể tải thông tin cửa hàng');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [visible, shopId]);

  const handleConfirm = async () => {
    if (!shopId || !action) {
      message.warning('Vui lòng chọn hành động');
      return;
    }

    try {
      setLoading(true);
      const payload: IVerifyShopPayload = {
        shopId,
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        rejectionReason: action === 'reject' ? reason : undefined,
      };
      const res: any = await verifyRegisterShop(payload);
      if (res?.error) throw new Error(res.error?.message ?? 'Failed');
      message.success('Thao tác thành công');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      message.error(err?.message ?? 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <ShopOutlined />
          <span>Chi tiết cửa hàng & Duyệt</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      onOk={handleConfirm}
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={loading}
      width={700}
      centered
    >
      {loading && !shop ? (
        <div className="text-center p-8">
          <Spin size="large" />
        </div>
      ) : shop ? (
        <div>
          {/* Shop Header */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            {shop.logo_url ? (
              <Avatar size={80} src={shop.logo_url} />
            ) : (
              <Avatar size={80} icon={<ShopOutlined />} style={{ backgroundColor: '#1890ff' }} />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">{shop.shop_name}</h3>
              <Tag color={shop.status === 'PENDING' ? 'orange' : shop.status === 'APPROVED' ? 'green' : 'red'}>
                {shop.status === 'PENDING' ? 'Chờ duyệt' : shop.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
              </Tag>
            </div>
          </div>

          {/* Shop Details */}
          <Divider orientation="left">Thông tin chi tiết</Divider>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={<span><MailOutlined /> Email</span>}>
              {shop.email}
            </Descriptions.Item>
            <Descriptions.Item label={<span><PhoneOutlined /> Số điện thoại</span>}>
              {shop.phone_number}
            </Descriptions.Item>
            <Descriptions.Item label={<span><HomeOutlined /> Địa chỉ</span>}>
              {typeof shop.address === 'object' && shop.address?.fullAddress 
                ? shop.address.fullAddress 
                : typeof shop.address === 'string' 
                  ? shop.address 
                  : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {shop.description || '—'}
            </Descriptions.Item>
            {shop.rejection_reason && (
              <Descriptions.Item label="Lý do từ chối">
                <span className="text-red-600">{shop.rejection_reason}</span>
              </Descriptions.Item>
            )}
          </Descriptions>

          {/* Verification Actions */}
          <Divider orientation="left">Hành động duyệt</Divider>
          <div className="space-y-3">
            <Radio.Group value={action ?? undefined} onChange={(e) => setAction(e.target.value)}>
              <Space direction="vertical" className="w-full">
                <Radio value="approve" className="w-full">
                  <Space>
                    <CheckCircleOutlined style={{ color: 'green' }} />
                    <span className="font-medium">Duyệt cửa hàng</span>
                  </Space>
                </Radio>
                <Radio value="reject" className="w-full">
                  <Space>
                    <CloseCircleOutlined style={{ color: 'red' }} />
                    <span className="font-medium">Từ chối đăng ký</span>
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>

            {action === 'reject' && (
              <TextArea
                placeholder="Nhập lý do từ chối (bắt buộc khi từ chối)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="mt-2"
              />
            )}
          </div>
        </div>
      ) : (
        <div className="text-center p-8 text-gray-400">
          <ShopOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <p>Không tìm thấy thông tin cửa hàng</p>
        </div>
      )}
    </Modal>
  );
};

export default VerifyShopModal;
