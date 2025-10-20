import React, { useEffect, useState } from 'react';
import { Modal, Radio, Input, Descriptions, Spin, message, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
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
        status: action === 'approve' ? 'APPROVE' : 'REJECT',
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
      title="Chi tiết cửa hàng & Duyệt"
      open={visible}
      onCancel={onClose}
      onOk={handleConfirm}
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={loading}
      style={{ top: 40 }}
      width={600}
      bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
    >
      {loading && !shop ? (
        <div className="text-center"><Spin /></div>
      ) : (
        <div>
          {shop ? (
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Tên cửa hàng">{shop.shop_name}</Descriptions.Item>
              <Descriptions.Item label="Email">{shop.email}</Descriptions.Item>
              <Descriptions.Item label="SĐT">{shop.phone_number}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">{shop.address}</Descriptions.Item>
              <Descriptions.Item label="Mô tả">{shop.description}</Descriptions.Item>
            </Descriptions>
          ) : null}

          <div className='mt-12 space-y-2'>
            <Space direction="vertical">
              <Radio.Group value={action ?? undefined} onChange={(e) => setAction(e.target.value)}>
                <Space direction="vertical">
                  <Radio value="approve">
                    <CheckCircleOutlined style={{ color: 'green', marginRight: 8 }} /> Duyệt
                  </Radio>
                  <Radio value="reject">
                    <CloseCircleOutlined style={{ color: 'red', marginRight: 8 }} /> Từ chối
                  </Radio>
                </Space>
              </Radio.Group>
            </Space>
            {action === 'reject' && (
                <TextArea className='flex w-full' placeholder="Lý do từ chối" value={reason} onChange={(e) => setReason(e.target.value)} style={{ width: '100%' }} />
              )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default VerifyShopModal;
