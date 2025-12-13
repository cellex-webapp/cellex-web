import { Tag } from 'antd';
import { 
  ShoppingCartOutlined, DollarCircleOutlined, 
  ShopOutlined, RiseOutlined, FallOutlined, MinusOutlined,
  UserAddOutlined, UsergroupAddOutlined, AppstoreOutlined
} from '@ant-design/icons';

// Format tiền tệ
export const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// Tag trạng thái đơn hàng (Mapping màu theo label từ API hoặc fallback)
export const StatusTag = ({ status }: { status: string }) => {
  const statusMap: Record<string, string> = {
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    SHIPPING: 'Đang giao',
    DELIVERED: 'Hoàn tất',
    CANCELLED: 'Đã hủy',
    // Allow already-localized inputs
    'Chờ xác nhận': 'Chờ xử lý',
    'Đã giao': 'Hoàn tất',
  };

  const colorMap: Record<string, string> = {
    PENDING: 'gold', 'Chờ xử lý': 'gold', 'Chờ xác nhận': 'gold',
    CONFIRMED: 'blue', 'Đã xác nhận': 'blue',
    SHIPPING: 'geekblue', 'Đang giao': 'geekblue',
    DELIVERED: 'green', 'Đã giao': 'green', 'Hoàn tất': 'green',
    CANCELLED: 'red', 'Đã hủy': 'red',
  };

  const label = statusMap[status] || status;
  const color = colorMap[status] || colorMap[label] || 'default';
  return <Tag color={color}>{label}</Tag>;
};

// Map string icon từ API sang Antd Icon
export const getIcon = (iconName: string, className?: string) => {
  const props = { className };
  switch (iconName) {
    case 'currency-dollar': return <DollarCircleOutlined {...props} />;
    case 'shopping-cart': return <ShoppingCartOutlined {...props} />;
    case 'users': return <UsergroupAddOutlined {...props} />;
    case 'user-plus': return <UserAddOutlined {...props} />;
    case 'store': return <ShopOutlined {...props} />;
    case 'package': return <AppstoreOutlined {...props} />;
    default: return <RiseOutlined {...props} />;
  }
};

// Icon xu hướng tăng/giảm
export const TrendIcon = ({ trend }: { trend: 'UP' | 'DOWN' | 'STABLE' }) => {
  if (trend === 'UP') return <RiseOutlined className="text-green-500" />;
  if (trend === 'DOWN') return <FallOutlined className="text-red-500" />;
  return <MinusOutlined className="text-gray-400" />;
};