import React, { useEffect, useState } from 'react';
import { Modal, Spin, Descriptions, message, Tag, Avatar, Divider } from 'antd';
import { ShopOutlined, MailOutlined, PhoneOutlined, HomeOutlined, StarOutlined } from '@ant-design/icons';
import { shopService } from '@/services/shop.service';

interface Props {
  visible: boolean;
  shopId: string | null;
  onClose: () => void;
  onRefresh?: () => void;
}

const ShopDetailModal: React.FC<Props> = ({ visible, shopId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState<IShop | null>(null);

  useEffect(() => {
    if (!visible || !shopId) return;
    let mounted = true;
    setLoading(true);
    shopService
      .getShopById(shopId)
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
    return () => {
      mounted = false;
    };
  }, [visible, shopId]);

  const statusConfig = {
    PENDING: { color: 'orange', text: 'Chờ duyệt' },
    APPROVED: { color: 'green', text: 'Đã duyệt' },
    REJECTED: { color: 'red', text: 'Từ chối' },
  };

  const formatAddress = (address: IAddress | string | null | undefined): string => {
    if (!address) {
      return '—';
    }

    if (typeof address === 'string') {
      return address;
    }

    if (typeof address === 'object') {
      if (address.fullAddress) {
        return address.fullAddress;
      }

      const parts = [
        address.street,
        address.commune,
        address.province,
      ];

      const validParts = parts.filter(part => part);

      if (validParts.length > 0) {
        return validParts.join(', ');
      }
    }

    return '—';
  };


  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ShopOutlined />
          <span>Chi tiết cửa hàng</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      style={{ top: 20 }}
    >
      {loading ? (
        <div className="text-center p-8">
          <Spin size="large" />
        </div>
      ) : shop ? (
        <div>
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            {shop.logo_url ? (
              <Avatar size={80} src={shop.logo_url} />
            ) : (
              <Avatar size={80} icon={<ShopOutlined />} style={{ backgroundColor: '#1890ff' }} />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">{shop.shop_name}</h3>
              <div className="flex gap-2 items-center">
                <Tag color={statusConfig[shop.status]?.color || 'default'}>
                  {statusConfig[shop.status]?.text || shop.status}
                </Tag>
                <div className="flex items-center gap-1 text-yellow-600">
                  <StarOutlined />
                  <span className="font-medium">{shop.rating?.toFixed(1) || '0.0'}</span>
                </div>
              </div>
            </div>
          </div>


          <Divider orientation="left">Thông tin liên hệ</Divider>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label={<span><MailOutlined /> Email</span>} span={2}>
              {shop.email}
            </Descriptions.Item>
            <Descriptions.Item label={<span><PhoneOutlined /> Số điện thoại</span>} span={2}>
              {shop.phone_number}
            </Descriptions.Item>

            <Descriptions.Item label={<span><HomeOutlined /> Địa chỉ</span>} span={2}>
              {formatAddress(shop.address)}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">Thông tin khác</Divider>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Mô tả" span={2}>
              {shop.description || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="ID Vendor">{shop.vendor_id || '—'}</Descriptions.Item>
            <Descriptions.Item label="Đánh giá">
              <span className="text-yellow-600 font-medium">⭐ {shop.rating?.toFixed(1) || '0.0'}</span>
            </Descriptions.Item>
            {shop.rejection_reason && (
              <Descriptions.Item label="Lý do từ chối" span={2}>
                <span className="text-red-600 font-medium">{shop.rejection_reason}</span>
              </Descriptions.Item>
            )}
          </Descriptions>

          <Divider orientation="left">Thông tin hệ thống</Divider>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Ngày tạo">
              {shop.created_at ? new Date(shop.created_at).toLocaleString('vi-VN') : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">
              {shop.updated_at ? new Date(shop.updated_at).toLocaleString('vi-VN') : '—'}
            </Descriptions.Item>
          </Descriptions>
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

export default ShopDetailModal;