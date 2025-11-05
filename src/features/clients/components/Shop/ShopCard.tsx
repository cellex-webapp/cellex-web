import React, { useEffect } from 'react';
import { Avatar, Button, Spin } from 'antd';
import { StarFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatMonthYear } from '@/utils/date';
import useShop from '@/hooks/useShop';

interface Props {
  shopId?: string | number;
  shop?: IShop | null;
  reviewCount?: number | string;
  productCount?: number | string;
  purchaseCount?: number | string;
  joinDate?: string;
  showViewLink?: boolean;
}

const ShopCard: React.FC<Props> = ({
  shopId,
  shop: shopProp,
  reviewCount = 0,
  productCount = 0,
  purchaseCount = 0,
  joinDate,
  showViewLink = true,
}) => {
  const { shop: shopFromStore, fetchShopById, isLoading } = useShop();

  useEffect(() => {
    if (shopId) {
      fetchShopById(String(shopId));
    }
  }, [shopId, fetchShopById]);

  const shop = shopProp ?? shopFromStore ?? null;

  const name = shop?.shop_name ?? '';
  const logo = shop?.logo_url ?? undefined;
  const rating = shop?.rating ?? 0;

  const formatNumber = (num: number | string) => {
    if (typeof num !== 'number') return num;
    if (num >= 1000000) return (num / 1000000).toFixed(0) + 'M';
    if (num >= 1000) {
      return (num / 1000).toLocaleString('vi-VN', {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
      }) + 'k';
    }
    return num.toString();
  };

  const statLabelClass = 'text-blue-600 text-sm cursor-pointer hover:underline';
  const statValueClass = 'text-sm font-semibold text-gray-900';

  const displayJoinDate = joinDate ?? (shop as any)?.created_at ?? undefined;

  return (
    <div className="flex items-start justify-between p-4 bg-white rounded-lg w-full">
      <div className="flex flex-row items-center gap-4">
        <div className="flex-shrink-0">
          {isLoading ? (
            <div className="w-20 h-20 flex items-center justify-center">
              <Spin />
            </div>
          ) : (
            <Avatar
              size={80}
              src={logo}
              className="bg-black flex items-center justify-center"
              style={{ backgroundColor: '#000' }}
            >
              {!logo && <span className="text-white text-3xl font-bold">A</span>}
            </Avatar>
          )}
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <div className="text-lg font-semibold text-gray-900">{name}</div>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarFilled
                key={star}
                className="!text-yellow-400"
                style={{ fontSize: '16px' }}
              />
            ))}
            <span className="text-sm font-semibold text-gray-900 ml-1">{rating}</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Button
              size="small"
              className="border border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 px-4 h-8 text-sm rounded-md"
            >
              Chat ngay
            </Button>
            {showViewLink && (
              <Link to={`/shops/${String((shop as any)?.id ?? shopId)}`}>
                <Button
                  size="small"
                  className="border border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 px-4 h-8 text-sm rounded-md"
                >
                  Xem shop
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-6 pt-1">
        <div className="flex items-center gap-3">
          <span className={statLabelClass}>Đánh giá</span>
          <span className={statValueClass}>{formatNumber(reviewCount)}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className={statLabelClass}>Sản phẩm</span>
          <span className={statValueClass}>{(shop as any)?.productCount ?? productCount ?? '-'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-y-6 pt-1">
        <div className="flex items-center gap-3">
          <span className={statLabelClass}>Tham gia</span>
          <span className={statValueClass}>{formatMonthYear(displayJoinDate)}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className={statLabelClass}>Lượt mua</span>
          <span className={statValueClass}>{formatNumber(purchaseCount)}</span>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;