import React, { useEffect } from 'react';
import { Card, List, Button, Empty, Tooltip, Skeleton, Space, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useCoupon } from '@/hooks/useCoupon';

const { Text } = Typography;

const formatDate = (s?: string | null) => (s ? new Date(s).toLocaleDateString('vi-VN') : '—');

const CouponItem: React.FC<{ c: IUserCoupon }> = ({ c }) => {
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(c.code);
    } catch { }
  };

  const formatPrice = (value?: number) => {
        if (value == null || Number.isNaN(value)) return '—';
        try { return value.toLocaleString('vi-VN') + ' ₫'; } catch { return String(value); }
    };

  return (
    <List.Item className="px-2 py-3">
      <div className="w-full">
        <div className="flex items-start justify-between gap-2">
          <Space direction="vertical" size={2}>
            <Text strong className="text-gray-900">{c.title || 'Phiếu giảm giá'}</Text>
          </Space>
          <Space>
            <Text strong keyboard className="text-base">{c.code}</Text>
            <Tooltip title="Sao chép mã">
              <Button size="small" icon={<CopyOutlined />} onClick={onCopy} />
            </Tooltip>
          </Space>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-700">
          <Space wrap size={12}>
            <Text>
              {c.couponType === 'PERCENTAGE' ? `Giảm ${c.discountValue}%` : `Giảm ${formatPrice(c.discountValue)}`}
            </Text>
            {typeof c.minOrderAmount === 'number' && c.minOrderAmount > 0 && (
              <Text>ĐH tối thiểu: <Text strong>{formatPrice(c.minOrderAmount)}</Text></Text>
            )}
            <Text>HSD: <Text strong>{formatDate(c.expiresAt)}</Text></Text>
          </Space>
        </div>
      </div>
    </List.Item>
  );
};

const CouponList: React.FC = () => {
  const { myCoupons, fetchMyCoupons, isLoading } = useCoupon();

  useEffect(() => {
    fetchMyCoupons();
  }, [fetchMyCoupons]);

  return (
    <Card
      size="small"
      className="mb-4 shadow-sm"
      title={<Typography.Text strong>Phiếu giảm giá của tôi</Typography.Text>}
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : (myCoupons && myCoupons.length > 0 ? (
        <List
          dataSource={myCoupons}
          renderItem={(c) => <CouponItem c={c} />}
          size="small"
        />
      ) : (
        <Empty description="Chưa có phiếu giảm giá" />
      ))}
    </Card>
  );
};

export default CouponList;